import {
	GenericValue,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	NodeOperationError,
} from 'n8n-workflow';
import { Lock } from 'async-await-mutex-lock';

const lock = new Lock();

/**
 * Sistema de Rate Limiting - 5 requisições por segundo
 */
interface RateLimitEntry {
	timestamps: number[];
	subdomain: string;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 1 * 1000; // 1 segundo

/**
 * Verifica e aplica rate limiting por subdomínio
 */
async function enforceRateLimit(subdomain: string): Promise<void> {
	const now = Date.now();
	const key = `ratelimit:${subdomain}`;

	// Obter ou criar entrada do rate limit
	let entry = rateLimitMap.get(key);
	if (!entry) {
		entry = {
			timestamps: [],
			subdomain: subdomain
		};
		rateLimitMap.set(key, entry);
	}

	// Limpar timestamps antigos (fora da janela de 1 segundo)
	entry.timestamps = entry.timestamps.filter(timestamp =>
		(now - timestamp) < RATE_LIMIT_WINDOW_MS
	);

	// Verificar se excedeu o limite
	if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
		const oldestRequest = Math.min(...entry.timestamps);
		const waitTime = RATE_LIMIT_WINDOW_MS - (now - oldestRequest);

		console.log(`[Rate Limit] Limite de ${RATE_LIMIT_MAX_REQUESTS} req/sec excedido para ${subdomain}. Aguardando ${Math.ceil(waitTime)}ms...`);

		// Aguardar até poder fazer nova requisição
		await new Promise(resolve => setTimeout(resolve, waitTime + 100));

		// Limpar timestamps novamente após a espera
		const newNow = Date.now();
		entry.timestamps = entry.timestamps.filter(timestamp =>
			(newNow - timestamp) < RATE_LIMIT_WINDOW_MS
		);
	}

	// Adicionar timestamp da requisição atual
	entry.timestamps.push(now);

	// Log de debug do rate limiting
	console.log(`[Rate Limit] ${subdomain}: ${entry.timestamps.length}/${RATE_LIMIT_MAX_REQUESTS} requests na janela atual`);

	// Limpar entradas antigas do mapa (limpeza periódica)
	if (Math.random() < 0.01) { // 1% de chance a cada requisição
		cleanupRateLimitMap();
	}
}

/**
 * Limpeza periódica do mapa de rate limit
 */
function cleanupRateLimitMap(): void {
	const now = Date.now();
	const keysToDelete: string[] = [];

	for (const [key, entry] of rateLimitMap.entries()) {
		// Limpar timestamps antigos
		entry.timestamps = entry.timestamps.filter(timestamp =>
			(now - timestamp) < RATE_LIMIT_WINDOW_MS
		);

		// Se não há timestamps recentes, marcar para remoção
		if (entry.timestamps.length === 0) {
			keysToDelete.push(key);
		}
	}

	// Remover entradas vazias
	keysToDelete.forEach(key => rateLimitMap.delete(key));
}

/**
 * Valida as credenciais necessárias para autenticação com a API do Kommo
 */
function validateCredentials(credentials: any, credentialType: string): void {
	console.log(`[Credentials] Validando credenciais do tipo: ${credentialType}`);
	console.log(`[Credentials] Credenciais recebidas:`, Object.keys(credentials || {}));

	if (!credentials) {
		throw new NodeOperationError(
			null as any,
			`Credenciais ${credentialType} não encontradas. Verifique se as credenciais estão configuradas corretamente.`,
			{
				description: 'Configure as credenciais do Kommo nas configurações do nó.',
			}
		);
	}

	// Validar campos obrigatórios baseado no tipo de credencial
	const requiredFields: string[] = [];

	if (credentialType === 'kommoOAuth2Api') {
		requiredFields.push('subdomain', 'clientId', 'clientSecret');
	} else if (credentialType === 'kommoLongLivedApi') {
		requiredFields.push('subdomain', 'accessToken');
	}

	console.log(`[Credentials] Campos obrigatórios para ${credentialType}:`, requiredFields);
	console.log(`[Credentials] Valores presentes:`, requiredFields.map(field => ({
		field,
		present: !!credentials[field],
		empty: credentials[field] === '' || credentials[field]?.trim() === ''
	})));

	const missingFields = requiredFields.filter(field => !credentials[field] || credentials[field].trim() === '');

	if (missingFields.length > 0) {
		throw new NodeOperationError(
			null as any,
			`Campos obrigatórios ausentes nas credenciais: ${missingFields.join(', ')}`,
			{
				description: `Verifique se os seguintes campos estão preenchidos nas credenciais ${credentialType}: ${missingFields.join(', ')}`,
			}
		);
	}

	// Validar formato do subdomain
	if (credentials.subdomain) {
		const subdomainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/;
		if (!subdomainPattern.test(credentials.subdomain)) {
			throw new NodeOperationError(
				null as any,
				'Formato de subdomínio inválido',
				{
					description: 'O subdomínio deve conter apenas letras, números e hífens, não podendo começar ou terminar com hífen.',
				}
			);
		}
	}
}

/**
 * Trata erros da API do Kommo de forma estruturada
 */
function handleApiError(error: any, node: any): NodeOperationError {
	const httpCode = error.cause?.response?.status || error.httpCode;
	const responseData = error.cause?.response?.data;

	// Tratar códigos de erro específicos
	switch (httpCode) {
		case 400:
			return new NodeOperationError(node, 'Requisição inválida - Verifique os parâmetros enviados', {
				description: responseData?.['validation-errors']
					? JSON.stringify(responseData['validation-errors'], null, 2)
					: 'Os dados enviados para a API são inválidos. Verifique os parâmetros obrigatórios.',
			});

		case 401:
			return new NodeOperationError(node, 'Falha na autenticação', {
				description: 'Token de acesso inválido ou expirado. Verifique suas credenciais do Kommo.',
			});

		case 403:
			return new NodeOperationError(node, 'Acesso negado', {
				description: 'Você não tem permissão para executar esta operação. Verifique os escopos do token.',
			});

		case 404:
			return new NodeOperationError(node, 'Recurso não encontrado', {
				description: 'O recurso solicitado não existe ou foi removido.',
			});

		case 429:
			return new NodeOperationError(node, 'Limite de requisições excedido', {
				description: 'Muitas requisições em pouco tempo. Aguarde alguns segundos antes de tentar novamente.',
			});

		case 500:
		case 502:
		case 503:
		case 504:
			return new NodeOperationError(node, 'Erro interno do servidor Kommo', {
				description: 'Erro temporário no servidor do Kommo. Tente novamente em alguns minutos.',
			});

		default:
			return new NodeOperationError(node, error.message || 'Erro desconhecido na API do Kommo', {
				description: responseData?.message || error.description || 'Erro não identificado ao comunicar com a API do Kommo.',
			});
	}
}
export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | GenericValue | GenericValue[] = {},
	qs: IDataObject = {},
	retryCount: number = 0,
): Promise<any> {
	const authenticationMethod = this.getNodeParameter('authentication', 0) as string;
	const credentialType = authenticationMethod === 'oAuth2' ? 'kommoOAuth2Api' : 'kommoLongLivedApi';
	const credentials = await this.getCredentials(credentialType);

	// Validar credenciais antes de fazer a requisição
	validateCredentials(credentials, credentialType);

	const options: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: `https://${credentials.subdomain}.kommo.com/api/v4/${endpoint}`,
		headers: {
			'content-type': 'application/json; charset=utf-8',
		},
	};

	try {
		// Aplicar lock global para serializar todas as requisições
		await lock.acquire();

		// Aplicar rate limiting específico por subdomínio
		await enforceRateLimit(String(credentials.subdomain));

		console.log(`[API Request] ${method} ${endpoint} - Subdomain: ${credentials.subdomain}`);

		// Log detalhado do payload sendo enviado
		if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
			console.log(`[API Request] PAYLOAD SENDO ENVIADO:`, JSON.stringify(body, null, 2));
		}

		return await this.helpers.httpRequestWithAuthentication.call(this, credentialType, options);
	} catch (error: unknown) {
		// Implementar retry automático para erros temporários
		const httpCode = (error as any).cause?.response?.status || (error as any).httpCode;
		const maxRetries = 3;

		if (retryCount < maxRetries && (httpCode === 429 || httpCode >= 500)) {
			const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10s
			console.log(`Tentativa ${retryCount + 1}/${maxRetries} falhou (HTTP ${httpCode}). Tentando novamente em ${backoffDelay}ms...`);

			// Aguardar antes do retry
			await new Promise(resolve => setTimeout(resolve, backoffDelay));

			// Tentar novamente
			return apiRequest.call(this, method, endpoint, body, qs, retryCount + 1);
		}

		// Log detalhado do erro para debug
		console.error(`[API Request] ERRO CAPTURADO:`, {
			httpCode: (error as any).cause?.response?.status || (error as any).httpCode,
			method,
			endpoint,
			errorMessage: (error as Error).message,
			responseData: (error as any).cause?.response?.data,
			validationErrors: (error as any).cause?.response?.data?.['validation-errors']
		});

		// Se não for erro que permite retry ou esgotou tentativas, tratar o erro
		throw handleApiError(error, this.getNode());
	} finally {
		lock.release();
	}
}

export async function apiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD',
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
) {
	const returnData: any[] = [];

	let responseData;
	query.page = 1;
	query.limit = query.limit ? query.limit : 250;

	do {
		responseData = await apiRequest.call(this, method, endpoint, body, query);
		query.page++;
		returnData.push(responseData);
	} while (responseData._links?.next?.href?.length);

	return returnData;
}

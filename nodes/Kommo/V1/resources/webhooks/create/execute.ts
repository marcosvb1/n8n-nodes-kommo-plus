import { IExecuteFunctions, NodeOperationError, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../../transport';
import { generateWebhookConfig } from '../../../helpers/webhookUtils';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const jsonParams = (await this.getNodeParameter('json', 0)) as boolean;

	if (jsonParams) {
		const jsonString = (await this.getNodeParameter('jsonString', 0)) as string;
		const responseData = await apiRequest.call(this, 'POST', 'webhooks', JSON.parse(jsonString));
		return this.helpers.returnJsonArray(responseData);
	}

	// Obter parâmetros do webhook
	const destination = this.getNodeParameter('destination', index) as string;
	const events = this.getNodeParameter('events', index) as string[];
	const secretKey = this.getNodeParameter('secretKey', index, '') as string;
	const disabled = this.getNodeParameter('disabled', index, false) as boolean;

	// Validar URL de destino
	try {
		new URL(destination);
	} catch (error) {
		throw new NodeOperationError(this.getNode(), 'Invalid destination URL', {
			description: 'The webhook destination must be a valid HTTP/HTTPS URL.',
		});
	}

	// Validar eventos
	if (!events || events.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one event must be selected', {
			description: 'Select which events should trigger this webhook.',
		});
	}

	// Gerar configuração do webhook
	const webhookConfig = generateWebhookConfig(events, destination, secretKey);

	// Preparar payload para API
	const webhookData: any = {
		destination: destination,
		settings: webhookConfig.settings,
		disabled: disabled ? 1 : 0,
	};

	// Adicionar secret key se fornecido
	if (secretKey) {
		webhookData.secret_key = secretKey;
	}

	// Opções adicionais
	const options = this.getNodeParameter('options', index, {}) as any;
	
	if (options.sort) {
		webhookData.sort = Number(options.sort);
	}

	if (options.description) {
		webhookData.description = options.description;
	}

	try {
		const responseData = await apiRequest.call(this, 'POST', 'webhooks', [webhookData]);
		
		// Adicionar informações úteis ao response
		const enrichedResponse = {
			...responseData,
			configured_events: events,
			webhook_url: destination,
			security_enabled: !!secretKey,
			created_at: new Date().toISOString(),
		};

		return this.helpers.returnJsonArray([enrichedResponse]);

	} catch (error: unknown) {
		// Tratar erros específicos da API
		if (error instanceof NodeOperationError) {
			const httpCode = (error.context as any)?.httpCode;

			if (httpCode === 400) {
				throw new NodeOperationError(this.getNode(), 'Invalid webhook configuration', {
					description: 'Check your webhook settings and destination URL. ' + error.message,
				});
			}

			if (httpCode === 403) {
				throw new NodeOperationError(this.getNode(), 'Insufficient permissions to create webhook', {
					description: 'Your API token does not have permission to create webhooks. Contact your Kommo administrator.',
				});
			}

			if (httpCode === 409) {
				throw new NodeOperationError(this.getNode(), 'Webhook already exists', {
					description: 'A webhook with this destination URL already exists. Use update operation instead.',
				});
			}
		}

		// Re-throw outros erros
		throw error;
	}
}

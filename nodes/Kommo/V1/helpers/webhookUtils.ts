/**
 * Utilitários para webhooks do Kommo
 */

import * as crypto from 'crypto';

export interface KommoWebhookEvent {
	account_id: number;
	event_type: 'lead_added' | 'lead_updated' | 'lead_deleted' |
	           'contact_added' | 'contact_updated' | 'contact_deleted' |
	           'company_added' | 'company_updated' | 'company_deleted' |
	           'task_added' | 'task_updated' | 'task_deleted' |
	           'purchase_added' | 'purchase_updated' | 'purchase_deleted';
	entity_id: number;
	entity_type: 'leads' | 'contacts' | 'companies' | 'tasks' | 'catalog_elements';
	created_at: number;
	updated_at: number;
	data: {
		old?: any;
		new?: any;
		diff?: any;
	};
}

export interface WebhookConfig {
	settings: string[];
	events: string[];
	destination: string;
	secret_key?: string;
}

/**
 * Valida a assinatura do webhook usando HMAC SHA-256
 */
export function validateWebhookSignature(
	payload: string,
	signature: string,
	secretKey: string
): boolean {
	if (!signature || !secretKey) {
		return false;
	}

	// Remove o prefixo 'sha256=' se presente
	const cleanSignature = signature.replace(/^sha256=/, '');

	// Gera hash HMAC do payload
	const expectedSignature = crypto
		.createHmac('sha256', secretKey)
		.update(payload, 'utf8')
		.digest('hex');

	// Comparação segura contra timing attacks
	return crypto.timingSafeEqual(
		Buffer.from(cleanSignature, 'hex'),
		Buffer.from(expectedSignature, 'hex')
	);
}

/**
 * Verifica se o timestamp do webhook não é muito antigo (proteção contra replay)
 */
export function validateWebhookTimestamp(
	timestamp: number,
	maxAgeSeconds: number = 300 // 5 minutos
): boolean {
	const now = Math.floor(Date.now() / 1000);
	const age = now - timestamp;

	return age >= 0 && age <= maxAgeSeconds;
}

/**
 * Extrai e valida dados do evento de webhook
 */
export function parseWebhookEvent(body: any): KommoWebhookEvent {
	if (!body || typeof body !== 'object') {
		throw new Error('Invalid webhook payload: body must be an object');
	}

	const requiredFields = ['account_id', 'event_type', 'entity_id', 'entity_type', 'created_at'];
	const missingFields = requiredFields.filter(field => !(field in body));

	if (missingFields.length > 0) {
		throw new Error(`Missing required webhook fields: ${missingFields.join(', ')}`);
	}

	// Validar tipos de evento suportados
	const supportedEvents = [
		'lead_added', 'lead_updated', 'lead_deleted',
		'contact_added', 'contact_updated', 'contact_deleted',
		'company_added', 'company_updated', 'company_deleted',
		'task_added', 'task_updated', 'task_deleted',
		'purchase_added', 'purchase_updated', 'purchase_deleted'
	];

	if (!supportedEvents.includes(body.event_type)) {
		throw new Error(`Unsupported event type: ${body.event_type}`);
	}

	return {
		account_id: Number(body.account_id),
		event_type: body.event_type,
		entity_id: Number(body.entity_id),
		entity_type: body.entity_type,
		created_at: Number(body.created_at),
		updated_at: Number(body.updated_at || body.created_at),
		data: body.data || {}
	};
}

/**
 * Gera configuração de webhook para diferentes tipos de eventos
 */
export function generateWebhookConfig(
	events: string[],
	destination: string,
	secretKey?: string
): WebhookConfig {
	// Settings básicas para webhook
	const settings = [
		'add_lead',
		'update_lead',
		'delete_lead',
		'add_contact',
		'update_contact',
		'delete_contact',
		'add_company',
		'update_company',
		'delete_company'
	];

	return {
		settings: settings.filter(setting => {
			// Mapear eventos para settings
			const eventMap: { [key: string]: string[] } = {
				'lead_added': ['add_lead'],
				'lead_updated': ['update_lead'],
				'lead_deleted': ['delete_lead'],
				'contact_added': ['add_contact'],
				'contact_updated': ['update_contact'],
				'contact_deleted': ['delete_contact'],
				'company_added': ['add_company'],
				'company_updated': ['update_company'],
				'company_deleted': ['delete_company']
			};

			return events.some(event => eventMap[event]?.includes(setting));
		}),
		events,
		destination,
		secret_key: secretKey
	};
}

/**
 * Normaliza dados do evento para formato consistente
 */
export function normalizeWebhookData(event: KommoWebhookEvent): any {
	const normalized: any = {
		id: event.entity_id,
		type: event.entity_type,
		event: event.event_type,
		account_id: event.account_id,
		timestamp: event.created_at,
		updated_at: event.updated_at,
		...event.data
	};

	// Adicionar informações específicas baseadas no tipo de entidade
	switch (event.entity_type) {
		case 'leads':
			normalized.resource_url = `/api/v4/leads/${event.entity_id}`;
			break;
		case 'contacts':
			normalized.resource_url = `/api/v4/contacts/${event.entity_id}`;
			break;
		case 'companies':
			normalized.resource_url = `/api/v4/companies/${event.entity_id}`;
			break;
		case 'catalog_elements':
			normalized.resource_url = `/api/v4/catalogs/elements/${event.entity_id}`;
			break;
		default:
			normalized.resource_url = null;
	}

	return normalized;
}

/**
 * Gera chave de cache para webhook baseada no evento
 */
export function generateWebhookCacheKey(event: KommoWebhookEvent): string {
	return `webhook:${event.account_id}:${event.entity_type}:${event.entity_id}:${event.created_at}`;
}

/**
 * Verifica se o evento é duplicado usando cache
 */
export function isDuplicateEvent(
	event: KommoWebhookEvent,
	cache: Map<string, number>,
	windowSeconds: number = 60
): boolean {
	const cacheKey = generateWebhookCacheKey(event);
	const now = Date.now();
	const eventTime = cache.get(cacheKey);

	if (eventTime && (now - eventTime) < (windowSeconds * 1000)) {
		return true; // Evento duplicado
	}

	// Armazenar evento no cache
	cache.set(cacheKey, now);

	// Limpar entradas antigas do cache
	for (const [key, time] of cache.entries()) {
		if ((now - time) > (windowSeconds * 1000)) {
			cache.delete(key);
		}
	}

	return false;
}

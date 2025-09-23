import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const qs: any = {};

	// Filtros opcionais
	const options = this.getNodeParameter('options', index, {}) as any;
	
	if (options.disabled !== undefined) {
		qs.filter = { disabled: options.disabled ? 1 : 0 };
	}

	if (!returnAll) {
		qs.limit = limit;
	}

	let responseData;

	if (returnAll) {
		responseData = await apiRequestAllItems.call(this, 'GET', 'webhooks', {}, qs);
		// Flatten the results from paginated responses
		const webhooks = responseData.flatMap((data) => {
			if (!data?._embedded?.webhooks) return [];
			return data._embedded.webhooks;
		});
		
		// Enriquecer dados dos webhooks
		const enrichedWebhooks = webhooks.map((webhook: any) => enrichWebhookData(webhook));
		
		return this.helpers.returnJsonArray(enrichedWebhooks);
	} else {
		responseData = await apiRequest.call(this, 'GET', 'webhooks', {}, qs);
		const webhooks = responseData?._embedded?.webhooks || [];
		
		// Enriquecer dados dos webhooks
		const enrichedWebhooks = webhooks.map((webhook: any) => enrichWebhookData(webhook));
		
		return this.helpers.returnJsonArray(enrichedWebhooks);
	}
}

/**
 * Enriquece dados do webhook com informações úteis
 */
function enrichWebhookData(webhook: any): any {
	return {
		...webhook,
		// Adicionar informações de status
		status: webhook.disabled ? 'disabled' : 'active',
		
		// Converter settings em eventos legíveis
		configured_events: mapSettingsToEvents(webhook.settings || []),
		
		// Adicionar informações de segurança
		security_enabled: !!webhook.secret_key,
		
		// Formatar datas
		created_at: webhook.created_at ? new Date(webhook.created_at * 1000).toISOString() : null,
		updated_at: webhook.updated_at ? new Date(webhook.updated_at * 1000).toISOString() : null,
		
		// Adicionar URL de gerenciamento
		management_url: webhook.id ? `/webhooks/${webhook.id}` : null,
	};
}

/**
 * Mapeia settings da API para eventos legíveis
 */
function mapSettingsToEvents(settings: string[]): string[] {
	const settingsMap: { [key: string]: string } = {
		'add_lead': 'lead_added',
		'update_lead': 'lead_updated',
		'delete_lead': 'lead_deleted',
		'add_contact': 'contact_added',
		'update_contact': 'contact_updated',
		'delete_contact': 'contact_deleted',
		'add_company': 'company_added',
		'update_company': 'company_updated',
		'delete_company': 'company_deleted',
		'add_task': 'task_added',
		'update_task': 'task_updated',
		'delete_task': 'task_deleted',
	};

	return settings
		.map(setting => settingsMap[setting])
		.filter(event => event !== undefined);
}

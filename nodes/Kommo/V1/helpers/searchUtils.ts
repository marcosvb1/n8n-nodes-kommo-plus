/**
 * Utilitários para pesquisa de recursos do Kommo
 */

export interface SearchParams {
	resource_type: 'leads' | 'contacts' | 'companies' | 'products' | 'catalogs';
	query?: string;
	filters?: {
		created_at?: { from: string; to: string };
		updated_at?: { from: string; to: string };
		status?: string[];
		tags?: string[];
		pipeline_id?: number;
		catalog_id?: number;
		responsible_user_id?: number;
	};
	limit?: number;
	page?: number;
	order?: {
		field: string;
		direction: 'asc' | 'desc';
	};
}

export interface SearchResult {
	id: number;
	name: string;
	type: string;
	preview: {
		title: string;
		subtitle?: string;
		description?: string;
		status?: string;
		tags?: string[];
		avatar?: string;
	};
	metadata: {
		created_at: string;
		updated_at: string;
		responsible_user?: {
			id: number;
			name: string;
		};
	};
	raw_data: any;
}

/**
 * Mapeia tipo de recurso para endpoint da API
 */
export function getSearchEndpoint(resourceType: string): string {
	const endpointMap: { [key: string]: string } = {
		leads: 'leads',
		contacts: 'contacts',
		companies: 'companies',
		products: 'catalogs/elements',
		catalogs: 'catalogs',
		tasks: 'tasks',
		notes: 'notes',
	};

	const endpoint = endpointMap[resourceType];
	if (!endpoint) {
		throw new Error(`Unsupported resource type: ${resourceType}`);
	}

	return endpoint;
}

/**
 * Constrói query parameters para busca
 */
export function buildSearchQuery(params: SearchParams): any {
	const qs: any = {};

	// Query de texto
	if (params.query && params.query.trim()) {
		qs.query = params.query.trim();
	}

	// Paginação
	if (params.limit) {
		qs.limit = Math.min(params.limit, 250); // Limite máximo da API
	}

	if (params.page) {
		qs.page = params.page;
	}

	// Ordenação
	if (params.order) {
		qs.order = {
			[params.order.field]: params.order.direction
		};
	}

	// Filtros específicos
	if (params.filters) {
		const filter: any = {};

		// Filtros de data
		if (params.filters.created_at) {
			filter.created_at = {
				from: Math.floor(new Date(params.filters.created_at.from).getTime() / 1000),
				to: Math.floor(new Date(params.filters.created_at.to).getTime() / 1000)
			};
		}

		if (params.filters.updated_at) {
			filter.updated_at = {
				from: Math.floor(new Date(params.filters.updated_at.from).getTime() / 1000),
				to: Math.floor(new Date(params.filters.updated_at.to).getTime() / 1000)
			};
		}

		// Filtros específicos por tipo
		if (params.resource_type === 'leads') {
			if (params.filters.pipeline_id) {
				filter.pipeline_id = params.filters.pipeline_id;
			}
			if (params.filters.status && params.filters.status.length > 0) {
				filter.statuses = params.filters.status.map(s => parseInt(s, 10));
			}
		}

		if (params.filters.responsible_user_id) {
			filter.responsible_user_id = params.filters.responsible_user_id;
		}

		if (params.filters.catalog_id) {
			filter.catalog_id = params.filters.catalog_id;
		}

		if (Object.keys(filter).length > 0) {
			qs.filter = filter;
		}
	}

	return qs;
}

/**
 * Normaliza resultado da API para formato padrão
 */
export function normalizeSearchResult(item: any, resourceType: string): SearchResult {
	const result: SearchResult = {
		id: item.id,
		name: item.name || 'Unnamed',
		type: resourceType,
		preview: {
			title: item.name || 'Unnamed',
		},
		metadata: {
			created_at: item.created_at ? new Date(item.created_at * 1000).toISOString() : '',
			updated_at: item.updated_at ? new Date(item.updated_at * 1000).toISOString() : '',
		},
		raw_data: item,
	};

	// Personalização por tipo de recurso
	switch (resourceType) {
		case 'leads':
			result.preview.subtitle = getLeadPipeline(item);
			result.preview.description = getLeadDescription(item);
			result.preview.status = getLeadStatus(item);
			result.preview.tags = item._embedded?.tags?.map((tag: any) => tag.name) || [];
			break;

		case 'contacts':
			result.preview.subtitle = getContactCompany(item);
			result.preview.description = getContactDescription(item);
			result.preview.status = 'Active';
			break;

		case 'companies':
			result.preview.subtitle = getCompanyDomain(item);
			result.preview.description = getCompanyDescription(item);
			result.preview.status = 'Active';
			break;

		case 'products':
			result.preview.subtitle = getProductPrice(item);
			result.preview.description = getProductDescription(item);
			result.preview.status = 'Available';
			break;

		case 'catalogs':
			result.preview.subtitle = getCatalogType(item);
			result.preview.description = getCatalogDescription(item);
			result.preview.status = item.type || 'catalog';
			break;
	}

	// Usuário responsável
	if (item.responsible_user_id && item._embedded?.users) {
		const user = item._embedded.users.find((u: any) => u.id === item.responsible_user_id);
		if (user) {
			result.metadata.responsible_user = {
				id: user.id,
				name: user.name,
			};
		}
	}

	return result;
}

// Funções auxiliares para extrair informações específicas

function getLeadPipeline(lead: any): string {
	if (lead._embedded?.pipeline) {
		return lead._embedded.pipeline.name;
	}
	return 'Unknown Pipeline';
}

function getLeadDescription(lead: any): string {
	const parts: string[] = [];

	if (lead.price) {
		parts.push(`$${lead.price.toLocaleString()}`);
	}

	if (lead._embedded?.contacts?.[0]) {
		parts.push(lead._embedded.contacts[0].name);
	}

	return parts.join(' • ');
}

function getLeadStatus(lead: any): string {
	if (lead._embedded?.status) {
		return lead._embedded.status.name;
	}
	return 'Unknown Status';
}

function getContactCompany(contact: any): string {
	if (contact._embedded?.companies?.[0]) {
		return contact._embedded.companies[0].name;
	}
	return 'No Company';
}

function getContactDescription(contact: any): string {
	const parts: string[] = [];

	if (contact.custom_fields_values) {
		const email = findCustomFieldValue(contact.custom_fields_values, 'EMAIL');
		const phone = findCustomFieldValue(contact.custom_fields_values, 'PHONE');

		if (email) parts.push(email);
		if (phone) parts.push(phone);
	}

	return parts.join(' • ');
}

function getCompanyDomain(company: any): string {
	if (company.custom_fields_values) {
		const website = findCustomFieldValue(company.custom_fields_values, 'WEB');
		if (website) {
			try {
				const url = new URL(website);
				return url.hostname;
			} catch {
				return website;
			}
		}
	}
	return 'No Website';
}

function getCompanyDescription(company: any): string {
	const parts: string[] = [];

	if (company._embedded?.contacts?.length) {
		parts.push(`${company._embedded.contacts.length} contacts`);
	}

	return parts.join(' • ');
}

function getProductPrice(product: any): string {
	if (product.custom_fields_values) {
		const price = findCustomFieldValue(product.custom_fields_values, 'PRICE');
		if (price) {
			return `$${parseFloat(price).toLocaleString()}`;
		}
	}
	return 'No Price';
}

function getProductDescription(product: any): string {
	if (product.custom_fields_values) {
		const description = findCustomFieldValue(product.custom_fields_values, 'DESCRIPTION');
		if (description) {
			return description.substring(0, 100) + (description.length > 100 ? '...' : '');
		}
	}
	return 'No Description';
}

function getCatalogType(catalog: any): string {
	const typeMap: { [key: string]: string } = {
		'products': 'Product Catalog',
		'invoices': 'Invoice Catalog',
		'regular': 'Regular Catalog',
	};

	return typeMap[catalog.type] || catalog.type || 'Catalog';
}

function getCatalogDescription(catalog: any): string {
	const parts: string[] = [];

	if (catalog.elements_count !== undefined) {
		parts.push(`${catalog.elements_count} items`);
	}

	return parts.join(' • ');
}

function findCustomFieldValue(customFields: any[], fieldCode: string): string | null {
	const field = customFields.find((cf: any) => cf.field_code === fieldCode);
	if (field && field.values?.[0]?.value) {
		return String(field.values[0].value);
	}
	return null;
}

/**
 * Gera chave de cache para busca
 */
export function generateSearchCacheKey(params: SearchParams): string {
	const key = `search:${params.resource_type}:${JSON.stringify(params)}`;
	return Buffer.from(key).toString('base64').substring(0, 50);
}

/**
 * Filtra resultados baseado em query de texto local
 */
export function filterResultsByQuery(results: SearchResult[], query: string): SearchResult[] {
	if (!query || !query.trim()) {
		return results;
	}

	const searchTerm = query.toLowerCase().trim();

	return results.filter(result => {
		return (
			result.name.toLowerCase().includes(searchTerm) ||
			result.preview.title.toLowerCase().includes(searchTerm) ||
			result.preview.subtitle?.toLowerCase().includes(searchTerm) ||
			result.preview.description?.toLowerCase().includes(searchTerm) ||
			result.preview.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
		);
	});
}

/**
 * Ordena resultados por relevância
 */
export function sortResultsByRelevance(results: SearchResult[], query: string): SearchResult[] {
	if (!query || !query.trim()) {
		return results;
	}

	const searchTerm = query.toLowerCase().trim();

	return results.sort((a, b) => {
		// Prioridade 1: Match exato no nome
		const aExactName = a.name.toLowerCase() === searchTerm;
		const bExactName = b.name.toLowerCase() === searchTerm;
		if (aExactName && !bExactName) return -1;
		if (!aExactName && bExactName) return 1;

		// Prioridade 2: Nome começa com o termo
		const aStartsWithName = a.name.toLowerCase().startsWith(searchTerm);
		const bStartsWithName = b.name.toLowerCase().startsWith(searchTerm);
		if (aStartsWithName && !bStartsWithName) return -1;
		if (!aStartsWithName && bStartsWithName) return 1;

		// Prioridade 3: Nome contém o termo
		const aContainsName = a.name.toLowerCase().includes(searchTerm);
		const bContainsName = b.name.toLowerCase().includes(searchTerm);
		if (aContainsName && !bContainsName) return -1;
		if (!aContainsName && bContainsName) return 1;

		// Fallback: ordenar por data de atualização
		return new Date(b.metadata.updated_at).getTime() - new Date(a.metadata.updated_at).getTime();
	});
}

import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';
import { findInvoicesCatalog } from '../../../helpers/purchasesUtils';

// Função para flatten dos custom fields conforme ajustes.md
function flattenCustomFields(elements: any[]): any[] {
	return elements.map(element => {
		if (!element.custom_fields_values) return element;

		const flattenedFields: any = {};
		element.custom_fields_values.forEach((field: any) => {
			if (field.field_name) {
				flattenedFields[field.field_name] = field.values;
			}
		});

		return {
			...element,
			custom_fields_values: flattenedFields
		};
	});
}

export async function execute(this: IExecuteFunctions, index: number): Promise<any> {
	// Identificar automaticamente o catálogo de invoices
	const catalogInfo = await findInvoicesCatalog(apiRequest, this);
	if (!catalogInfo) {
		throw new NodeOperationError(this.getNode(), 'Catálogo de invoices não encontrado', {
			description: 'Não foi possível encontrar um catálogo de tipo "invoices" na sua conta Kommo.'
		});
	}

	const { catalog } = catalogInfo;
	const endpoint = `catalogs/${catalog.id}/elements`;

	console.log(`[Purchases GET] Usando catálogo: ${catalog.name} (ID: ${catalog.id})`);

	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const qs: any = {};

	if (!returnAll) {
		qs.limit = limit;
	}

	if (returnAll) {
		const responseData = await apiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
		const elements = responseData.flatMap((data) => {
			if (!data?._embedded?.elements) return [];
			return data._embedded.elements;
		});

		// Aplicar flattening dos custom fields
		return this.helpers.returnJsonArray(flattenCustomFields(elements));
	} else {
		const responseData = await apiRequest.call(this, 'GET', endpoint, {}, qs);
		const elements = responseData?._embedded?.elements || [];

		// Aplicar flattening dos custom fields
		return this.helpers.returnJsonArray(flattenCustomFields(elements));
	}
}

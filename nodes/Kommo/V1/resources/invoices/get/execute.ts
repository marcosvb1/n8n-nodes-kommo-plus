import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';
import { findInvoicesCatalog } from '../../../helpers/purchasesUtils';

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

    const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
    const limit = this.getNodeParameter('limit', index, 50) as number;

    const qs: any = {};

    // Filtros (IDs, datas e custom fields)
    const filter = (this.getNodeParameter('filter', 0, {}) as IDataObject) || {};
    const filterCopy = JSON.parse(JSON.stringify(filter));
    const filterOut: any = {};

    // IDs simples
    if (filterCopy.id) {
        filterOut.id = String(filterCopy.id)
            .split(',')
            .map((el: string) => Number(el.trim()));
        delete filterCopy.id;
    }
    // Datas
    const makeRange = (range?: any) => {
        if (!range?.dateRangeCustomProperties) return undefined;
        const { from, to } = range.dateRangeCustomProperties as { from?: string; to?: string };
        const out: any = {};
        if (from) out.from = from;
        if (to) out.to = to;
        return Object.keys(out).length ? out : undefined;
    };
    if (filterCopy.created_at) {
        filterOut.created_at = makeRange(filterCopy.created_at);
        delete filterCopy.created_at;
    }
    if (filterCopy.updated_at) {
        filterOut.updated_at = makeRange(filterCopy.updated_at);
        delete filterCopy.updated_at;
    }

    // Custom fields: filter.custom_fields_values.custom_field[] com { data(json:{id,type}), value }
    if (filterCopy.custom_fields_values?.custom_field) {
        const list = filterCopy.custom_fields_values.custom_field as Array<{ data: string; value: any }>;
        const cfValues = list
            .map((cf) => {
                try {
                    const parsed = JSON.parse(cf.data as unknown as string) as { id: number; type: string };
                    if (typeof cf.value === 'undefined' || cf.value === '') return null;
                    return { id: parsed.id, values: [{ value: cf.value }] };
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
        if (cfValues.length) {
            filterOut.custom_fields_values = cfValues;
        }
        delete filterCopy.custom_fields_values;
    }

    if (Object.keys(filterOut).length) qs.filter = filterOut;

    if (!returnAll) {
        qs.limit = limit;
    }

	if (returnAll) {
		const pages = await apiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
		return pages.flatMap((page: any) => page?._embedded?.elements ?? []);
	}

	const responseData = await apiRequest.call(this, 'GET', endpoint, {}, qs);
	return (responseData as any)?._embedded?.elements ?? responseData;
}

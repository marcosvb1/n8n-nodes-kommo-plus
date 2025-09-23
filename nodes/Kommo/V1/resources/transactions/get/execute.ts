import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';

interface FilterFromFrontend {
	query?: string;
	id?: string;
}

interface IFilter {
	id?: number[];
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const body = {} as IDataObject;
	const qs = {} as IDataObject;
    const simplify = this.getNodeParameter('simplify', 0, true) as boolean;

	//--------------------------------Add filter--------------------------------------

	const filter = this.getNodeParameter('filter', 0) as FilterFromFrontend;
	if (filter.query) qs.query = filter.query;

	const filterWithoutQuery = JSON.parse(JSON.stringify(filter)) as FilterFromFrontend;
	delete filterWithoutQuery.query;

	if (Object.keys(filterWithoutQuery).length) {
		qs.filter = {
			id: filterWithoutQuery.id
				?.toString()
				.split(',')
				.map((el) => Number(el.trim())),
		} as IFilter;
	}

	//------------------------------Add pagination-------------------------------------
	const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
	if (!returnAll) {
		const page = this.getNodeParameter('page', 0) as number;
		qs.page = page;
	}
	const limit = this.getNodeParameter('limit', 0) as number;
	qs.limit = limit;

	//---------------------------------------------------------------------------------

	const listId = this.getNodeParameter('catalog_id', 0) as boolean;

	const requestMethod = 'GET';
	const endpoint = `catalogs/${listId}/elements`;

	const flattenCustomFields = (element: any) => {
		if (!element.custom_fields_values) return element;
		const customFields: IDataObject = {};
		for (const cf of element.custom_fields_values) {
			customFields[cf.field_name] = cf.values[0]?.value;
		}
		element.custom_fields_values = customFields;
		return element;
	}

    if (returnAll) {
        const pages = await await apiRequestAllItems.call(
            this,
            requestMethod,
            endpoint,
            body,
            qs,
        );
        if (simplify) {
            const elements = pages.flatMap((page: any) => page?._embedded?.elements ?? []);
			const flattenedElements = elements.map(flattenCustomFields);
            return this.helpers.returnJsonArray(flattenedElements);
        }
        return this.helpers.returnJsonArray(pages);
    }

    const responseData = await apiRequest.call(this, requestMethod, endpoint, body, qs);
    if (simplify) {
        const elements = (responseData as any)?._embedded?.elements ?? [];
		const flattenedElements = elements.map(flattenCustomFields);
        return this.helpers.returnJsonArray(flattenedElements);
    }
    return this.helpers.returnJsonArray(responseData);
}

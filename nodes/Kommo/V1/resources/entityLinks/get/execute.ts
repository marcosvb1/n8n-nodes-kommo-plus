import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const entityType = this.getNodeParameter('entity_type', index) as string;
	const entityId = this.getNodeParameter('entity_id', index) as number;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const qs: IDataObject = {};
	const body = {} as IDataObject;

	// Filtros opcionais
	const filter = this.getNodeParameter('filter', index, {}) as IDataObject;
	const filterObj: IDataObject = {};
	
	if (filter.to_entity_type) {
		filterObj.to_entity_type = filter.to_entity_type;
	}
	if (filter.to_entity_id) {
		filterObj.to_entity_id = filter.to_entity_id;
	}
	
	if (Object.keys(filterObj).length > 0) {
		qs.filter = filterObj;
	}

	// Paginação
	if (!returnAll) {
		const page = this.getNodeParameter('page', index) as number;
		qs.page = page;
		qs.limit = limit;
	}

	const endpoint = `${entityType}/${entityId}/links`;
	const method = 'GET';

	if (returnAll) {
		const pages = await apiRequestAllItems.call(this, method, endpoint, body, qs);
		const items = pages.flatMap((p: any) => p?._embedded?.links ?? []);
		return items as IDataObject[];
	}

	const responseData = await apiRequest.call(this, method, endpoint, body, qs);
	return (responseData as any)?._embedded?.links ?? responseData;
}


import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../../transport';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const qs = {} as IDataObject;
	const body = {} as IDataObject;

	const category = (await this.getNodeParameter('category', 0)) as string;

	const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
	if (!returnAll) {
		const page = this.getNodeParameter('page', 0) as number;
		qs.page = page;
	}
	const limit = this.getNodeParameter('limit', 0) as number;
	qs.limit = limit;

	const endpoint = `leads/unsorted/${category}`;
	const method = 'GET';

	if (returnAll) {
		const responseData = await apiRequestAllItems.call(this, method, endpoint, body, qs);
		return this.helpers.returnJsonArray(responseData);
	}

	const responseData = await apiRequest.call(this, method, endpoint, body, qs);
	return this.helpers.returnJsonArray(responseData);
}



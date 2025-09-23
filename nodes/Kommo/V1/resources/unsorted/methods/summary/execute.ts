import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../../transport';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const body = {} as IDataObject;
	const category = (await this.getNodeParameter('category', 0)) as string;
	const endpoint = `leads/unsorted/${category}/summary`;
	const method = 'GET';
	const responseData = await apiRequest.call(this, method, endpoint, body, {});
	return this.helpers.returnJsonArray(responseData);
}



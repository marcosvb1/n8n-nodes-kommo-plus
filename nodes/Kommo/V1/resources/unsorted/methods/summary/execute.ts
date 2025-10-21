import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../../transport';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const body = {} as IDataObject;
	const category = (await this.getNodeParameter('category', index)) as string;
	const endpoint = `leads/unsorted/${category}/summary`;
	const method = 'GET';
	const responseData = await apiRequest.call(this, method, endpoint, body, {});
	return responseData as IDataObject | IDataObject[];
}



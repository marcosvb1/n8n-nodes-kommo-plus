import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../../transport';

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const uid = (await this.getNodeParameter('uid', 0)) as string;
  const user_id = (await this.getNodeParameter('user_id', 0)) as number;

  const body: IDataObject = {};
  if (user_id) body.user_id = user_id;

  const method = 'DELETE';
  const endpoint = `leads/unsorted/${uid}/decline`;
  const responseData = await apiRequest.call(this, method, endpoint, body, {});
  return this.helpers.returnJsonArray(responseData);
}



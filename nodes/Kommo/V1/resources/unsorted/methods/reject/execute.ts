import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../../transport';

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<IDataObject | IDataObject[]> {
  const uid = (await this.getNodeParameter('uid', index)) as string;
  const user_id = (await this.getNodeParameter('user_id', index)) as number;

  const body: IDataObject = {};
  if (user_id) body.user_id = user_id;

  const method = 'POST';
  const endpoint = `leads/unsorted/${uid}/decline`;
  const responseData = await apiRequest.call(this, method, endpoint, body, {});
  return responseData as IDataObject | IDataObject[];
}



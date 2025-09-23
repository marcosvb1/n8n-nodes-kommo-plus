import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../../transport';

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const uid = (await this.getNodeParameter('uid', 0)) as string;
  const entity_type = (await this.getNodeParameter('entity_type', 0)) as string;
  const entity_id = (await this.getNodeParameter('entity_id', 0)) as number;
  const user_id = (await this.getNodeParameter('user_id', 0)) as number;

  const body: IDataObject = {
    link: {
      entity_id,
      entity_type,
    },
  };
  if (user_id) body.user_id = user_id;

  const method = 'POST';
  const endpoint = `leads/unsorted/${uid}/link`;
  const responseData = await apiRequest.call(this, method, endpoint, body, {});
  return this.helpers.returnJsonArray(responseData);
}



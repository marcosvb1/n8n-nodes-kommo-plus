import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../../transport';

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<IDataObject | IDataObject[]> {
  const uid = (await this.getNodeParameter('uid', index)) as string;
  const entity_type = (await this.getNodeParameter('entity_type', index)) as string;
  const entity_id = (await this.getNodeParameter('entity_id', index)) as number;
  const user_id = (await this.getNodeParameter('user_id', index)) as number;

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
  return responseData as IDataObject | IDataObject[];
}



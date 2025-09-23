import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../transport';

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const body = {
    mode: (await this.getNodeParameter('mode', 0)) as string,
    is_enabled: (await this.getNodeParameter('is_enabled', 0)) as boolean,
  } as IDataObject;

  const responseData = await apiRequest.call(this, 'PATCH', 'customers/mode', body);
  return this.helpers.returnJsonArray([responseData as IDataObject]);
}



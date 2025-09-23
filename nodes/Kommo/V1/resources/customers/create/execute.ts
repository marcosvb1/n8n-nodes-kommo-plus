import { INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { clearNullableProps } from '../../../helpers/clearNullableProps';
import { ICustomFieldValuesForm } from '../../../Interface';

import { apiRequest } from '../../../transport';
import { makeCustomFieldReqObject } from '../../_components/CustomFieldsDescription';
import { makeTagsArray } from '../../../helpers/makeTagsArray';
import { getTimestampFromDateString } from '../../../helpers/getTimestampFromDateString';

interface IForm {
  customer: Array<{
    name?: string;
    responsible_user_id?: number | number[];
    created_by?: number | number[];
    updated_by?: number | number[];
    created_at?: string;
    updated_at?: string;
    custom_fields_values?: ICustomFieldValuesForm;
    _embedded?: {
      tags?: Array<{ id: number[] | string[] }>;
    };
    request_id?: string;
  }>;
}

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestMethod = 'POST';
  const endpoint = `customers`;

  const jsonParams = (await this.getNodeParameter('json', 0)) as boolean;

  if (jsonParams) {
    const jsonString = (await this.getNodeParameter('jsonString', 0)) as string;
    const responseData = await apiRequest.call(
      this,
      requestMethod,
      endpoint,
      JSON.parse(jsonString),
    );
    return this.helpers.returnJsonArray(responseData);
  }

  const collection = (await this.getNodeParameter('collection', 0)) as IForm;

  const body = collection.customer
    .map((customer) => ({
      ...customer,
      created_at: getTimestampFromDateString(customer.created_at),
      updated_at: getTimestampFromDateString(customer.updated_at),
      custom_fields_values:
        customer.custom_fields_values && makeCustomFieldReqObject(customer.custom_fields_values),
      _embedded: {
        ...customer._embedded,
        tags: customer._embedded?.tags?.flatMap(makeTagsArray),
      },
    }))
    .map(clearNullableProps);

  const responseData = await apiRequest.call(this, requestMethod, endpoint, body);
  return this.helpers.returnJsonArray(responseData);
}



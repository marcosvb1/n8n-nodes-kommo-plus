import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../../transport';
import { getTimestampFromDateString } from '../../../../helpers/getTimestampFromDateString';
import { makeCustomFieldReqObject } from '../../../_components/CustomFieldsDescription';

interface ICreateItemFrontend {
  source_name: string;
  source_uid: string;
  pipeline_id?: number;
  created_at?: string;
  request_id?: string;
  metadata?: { fields?: Record<string, string> };
  _embedded?: {
    lead?: { name?: string; price?: number; visitor_uid?: string; tags?: string; custom_fields_values?: any };
    contact?: { name?: string; first_name?: string; last_name?: string; custom_fields_values?: any };
    company?: { name?: string; custom_fields_values?: any };
  };
}

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const method = 'POST';
  const endpoint = `leads/unsorted/forms/summary`;

  const jsonParams = (await this.getNodeParameter('json', 0)) as boolean;
  if (jsonParams) {
    const jsonString = (await this.getNodeParameter('jsonString', 0)) as string;
    const responseData = await apiRequest.call(this, method, endpoint, JSON.parse(jsonString));
    return this.helpers.returnJsonArray(responseData);
  }

  const items = (await this.getNodeParameter('items', 0)) as { item: ICreateItemFrontend[] };

  const payload = items.item.map((i) => {
    const metadata = i.metadata?.fields || {};

    const body: IDataObject = {
      request_id: i.request_id || undefined,
      source_name: i.source_name,
      source_uid: i.source_uid,
      pipeline_id: i.pipeline_id || undefined,
      created_at: getTimestampFromDateString(i.created_at),
      metadata: {
        form_id: metadata.form_id,
        form_name: metadata.form_name,
        form_page: metadata.form_page,
        ip: metadata.ip,
        form_sent_at: metadata.form_sent_at
          ? getTimestampFromDateString(metadata.form_sent_at as unknown as string)
          : undefined,
        referer: metadata.referer,
      },
      _embedded: {
        leads: i._embedded?.lead
          ? [
              {
                ...i._embedded.lead,
                _embedded: i._embedded.lead.tags
                  ? { tags: i._embedded.lead.tags.split(',').map((name) => ({ name: name.trim() })) }
                  : undefined,
                custom_fields_values: i._embedded.lead.custom_fields_values
                  ? makeCustomFieldReqObject(i._embedded.lead.custom_fields_values as any)
                  : undefined,
              },
            ]
          : undefined,
        contacts: i._embedded?.contact
          ? [
              {
                ...i._embedded.contact,
                custom_fields_values: i._embedded.contact.custom_fields_values
                  ? makeCustomFieldReqObject(i._embedded.contact.custom_fields_values as any)
                  : undefined,
              },
            ]
          : undefined,
        companies: i._embedded?.company
          ? [
              {
                ...i._embedded.company,
                custom_fields_values: i._embedded.company.custom_fields_values
                  ? makeCustomFieldReqObject(i._embedded.company.custom_fields_values as any)
                  : undefined,
              },
            ]
          : undefined,
      },
    };

    // Remove undefined/null keys
    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
    if (body._embedded && typeof body._embedded === 'object') {
      const emb = body._embedded as IDataObject;
      if (!('leads' in emb)) delete emb.leads;
      if (!('contacts' in emb)) delete emb.contacts;
      if (!('companies' in emb)) delete emb.companies;
      if (Object.keys(emb).length === 0) delete body._embedded;
    }
    if (body.metadata) {
      Object.keys(body.metadata).forEach(
        (k) => (body.metadata as IDataObject)[k] === undefined && delete (body.metadata as IDataObject)[k],
      );
      if (Object.keys(body.metadata).length === 0) delete body.metadata;
    }

    return body;
  });

  const responseData = await apiRequest.call(this, method, endpoint, payload);
  return this.helpers.returnJsonArray(responseData);
}



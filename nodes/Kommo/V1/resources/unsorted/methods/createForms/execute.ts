import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
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
): Promise<IDataObject | IDataObject[]> {
  const method = 'POST';
  const endpoint = `leads/unsorted/forms`;

  const jsonParams = (await this.getNodeParameter('json', index)) as boolean;
  if (jsonParams) {
    const jsonString = (await this.getNodeParameter('jsonString', index)) as string;
    const responseData = await apiRequest.call(this, method, endpoint, JSON.parse(jsonString));
    return responseData as IDataObject | IDataObject[];
  }

  const items = (await this.getNodeParameter('items', index)) as { item: ICreateItemFrontend[] };

  const payload = items.item.map((i) => {
    const metadataFields = i.metadata?.fields || {};

    // Construir body sem adicionar undefined
    const body: IDataObject = {
      source_name: i.source_name,
      source_uid: i.source_uid,
    };

    // Adicionar campos opcionais apenas se tiverem valor
    if (i.request_id) body.request_id = i.request_id;
    if (i.pipeline_id) body.pipeline_id = i.pipeline_id;
    if (i.created_at) body.created_at = getTimestampFromDateString(i.created_at);

    // Construir metadata apenas com campos preenchidos
    const metadata: IDataObject = {};
    if (metadataFields.form_id) metadata.form_id = metadataFields.form_id;
    if (metadataFields.form_name) metadata.form_name = metadataFields.form_name;
    if (metadataFields.form_page) metadata.form_page = metadataFields.form_page;
    if (metadataFields.ip) metadata.ip = metadataFields.ip;
    if (metadataFields.form_sent_at) {
      metadata.form_sent_at = getTimestampFromDateString(metadataFields.form_sent_at as unknown as string);
    }
    if (metadataFields.referer) metadata.referer = metadataFields.referer;
    
    if (Object.keys(metadata).length > 0) {
      body.metadata = metadata;
    }

    // Construir _embedded apenas com entidades preenchidas
    const embedded: IDataObject = {};

    if (i._embedded?.lead) {
      const leadData: IDataObject = { ...i._embedded.lead };
      
      // Adicionar tags se existirem
      if (i._embedded.lead.tags) {
        leadData._embedded = {
          tags: i._embedded.lead.tags.split(',').map((name) => ({ name: name.trim() }))
        };
      }
      
      // Adicionar custom fields se existirem
      if (i._embedded.lead.custom_fields_values) {
        leadData.custom_fields_values = makeCustomFieldReqObject(i._embedded.lead.custom_fields_values as any);
      }
      
      embedded.leads = [leadData];
    }

    if (i._embedded?.contact) {
      const contactData: IDataObject = { ...i._embedded.contact };
      
      if (i._embedded.contact.custom_fields_values) {
        contactData.custom_fields_values = makeCustomFieldReqObject(i._embedded.contact.custom_fields_values as any);
      }
      
      embedded.contacts = [contactData];
    }

    if (i._embedded?.company) {
      const companyData: IDataObject = { ...i._embedded.company };
      
      if (i._embedded.company.custom_fields_values) {
        companyData.custom_fields_values = makeCustomFieldReqObject(i._embedded.company.custom_fields_values as any);
      }
      
      embedded.companies = [companyData];
    }

    if (Object.keys(embedded).length > 0) {
      body._embedded = embedded;
    }

    return body;
  });

  const responseData = await apiRequest.call(this, method, endpoint, payload);
  return responseData as IDataObject | IDataObject[];
}



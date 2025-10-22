import { INodeExecutionData, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { clearNullableProps } from '../../../helpers/clearNullableProps';
import { ICustomFieldValuesForm } from '../../../Interface';

import { apiRequest } from '../../../transport';
import { makeCustomFieldReqObject } from '../../_components/CustomFieldsDescription';
import { makeTagsArray } from '../../../helpers/makeTagsArray';
import { getTimestampFromDateString } from '../../../helpers/getTimestampFromDateString';

interface IFormLeadComplex {
	lead: Array<{
		name?: string;
		price?: number;
		pipeline_id?: number;
		status_id?: number;
		created_by?: number;
		updated_by?: number;
		responsible_user_id?: number;
		closed_at?: string;
		created_at?: string;
		updated_at?: string;
		loss_reason_id?: number;
		custom_fields_values?: ICustomFieldValuesForm;
		_embedded?: {
			tags?: Array<{
				id: number;
			}>;
			contacts?: Array<{
				name?: string;
				first_name?: string;
				last_name?: string;
				custom_fields_values?: ICustomFieldValuesForm;
			}>;
			companies?: Array<{
				id: number;
			}>;
		};
	}>;
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const requestMethod = 'POST';
	const endpoint = `leads/complex`;

	const jsonParams = (await this.getNodeParameter('json', index)) as boolean;

	if (jsonParams) {
		const jsonString = (await this.getNodeParameter('jsonString', index)) as string;
		const responseData = await apiRequest.call(
			this,
			requestMethod,
			endpoint,
			JSON.parse(jsonString),
		);
		return this.helpers.returnJsonArray(responseData);
	}

	const leadsCollection = (await this.getNodeParameter('collection', index)) as IFormLeadComplex;

	const body = leadsCollection.lead.map((lead) => {
		const leadBody: IDataObject = {
			name: lead.name,
			price: lead.price,
			pipeline_id: lead.pipeline_id,
			status_id: lead.status_id,
			created_by: lead.created_by,
			updated_by: lead.updated_by,
			responsible_user_id: lead.responsible_user_id,
			loss_reason_id: lead.loss_reason_id,
		};

		// Processar timestamps
		if (lead.created_at) leadBody.created_at = getTimestampFromDateString(lead.created_at);
		if (lead.updated_at) leadBody.updated_at = getTimestampFromDateString(lead.updated_at);
		if (lead.closed_at) leadBody.closed_at = getTimestampFromDateString(lead.closed_at);

		// Processar custom fields do lead
		if (lead.custom_fields_values) {
			leadBody.custom_fields_values = makeCustomFieldReqObject(lead.custom_fields_values);
		}

		// Processar _embedded
		const embedded: IDataObject = {};

		if (lead._embedded?.tags) {
			embedded.tags = lead._embedded.tags.map((tag) => ({ id: tag.id }));
		}

		if (lead._embedded?.contacts) {
			embedded.contacts = lead._embedded.contacts.map((contact) => {
				const contactData: IDataObject = {
					name: contact.name,
					first_name: contact.first_name,
					last_name: contact.last_name,
				};

				if (contact.custom_fields_values) {
					contactData.custom_fields_values = makeCustomFieldReqObject(contact.custom_fields_values);
				}

				return contactData;
			});
		}

		if (lead._embedded?.companies) {
			embedded.companies = lead._embedded.companies.map((company) => ({
				id: company.id,
			}));
		}

		if (Object.keys(embedded).length > 0) {
			leadBody._embedded = embedded;
		}

		return clearNullableProps(leadBody);
	});

	const responseData = await apiRequest.call(this, requestMethod, endpoint, body);
	return this.helpers.returnJsonArray(responseData);
}


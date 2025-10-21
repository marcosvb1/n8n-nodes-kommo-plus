import { INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
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
		pipeline_id?: number | number[];
		status_id?: number | number[];
		created_by?: number | number[];
		updated_by?: number | number[];
		responsible_user_id?: number | number[];
		closed_at?: string;
		created_at?: string;
		updated_at?: string;
		loss_reason_id?: number | number[];
		custom_fields_values?: ICustomFieldValuesForm;
		_embedded?: {
			tags?: Array<{
				id: number[];
			}>;
			contacts?: Array<{
				contact: {
					contactItem: Array<{
						name?: string;
						first_name?: string;
						last_name?: string;
						custom_fields_values?: ICustomFieldValuesForm;
					}>;
				};
			}>;
			companies?: Array<{
				id: {
					company: Array<{
						id: number;
					}>;
				};
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

	const body = leadsCollection.lead
		.map((lead) => ({
			...lead,
			created_at: getTimestampFromDateString(lead.created_at),
			updated_at: getTimestampFromDateString(lead.updated_at),
			closed_at: getTimestampFromDateString(lead.closed_at),
			custom_fields_values:
				lead.custom_fields_values && makeCustomFieldReqObject(lead.custom_fields_values),
			_embedded: {
				...lead._embedded,
				tags: lead._embedded?.tags?.flatMap(makeTagsArray),
				contacts: lead._embedded?.contacts?.flatMap((group) =>
					group.contact.contactItem.map((contact) => ({
						name: contact.name,
						first_name: contact.first_name,
						last_name: contact.last_name,
						custom_fields_values:
							contact.custom_fields_values &&
							makeCustomFieldReqObject(contact.custom_fields_values),
					})),
				),
				companies: lead._embedded?.companies?.flatMap((group) =>
					group.id.company.map((company) => ({ id: company.id })),
				),
			},
		}))
		.map(clearNullableProps);

	const responseData = await apiRequest.call(this, requestMethod, endpoint, body);
	return this.helpers.returnJsonArray(responseData);
}


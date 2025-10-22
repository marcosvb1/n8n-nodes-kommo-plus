/* eslint-disable n8n-nodes-base/node-param-fixed-collection-type-unsorted-items */
import { IDisplayOptions, INodeProperties } from 'n8n-workflow';
import { ILeadsProperties } from '../../interfaces';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';
import { makeLeadModelDescription } from '../model';
import { addCustomFieldDescription } from '../../_components/CustomFieldsDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['leads'],
		operation: ['createLeadsComplex'],
	},
};

export const createLeadComplexModel: INodeProperties[] = makeLeadModelDescription([
	{
		displayName: 'Contacts',
		name: 'contacts',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		placeholder: 'Add contact',
		options: [
			{
				displayName: 'Contact',
				name: 'contact',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Full name of the contact',
					},
					{
						displayName: 'First Name',
						name: 'first_name',
						type: 'string',
						default: '',
						description: 'First name of the contact',
					},
					{
						displayName: 'Last Name',
						name: 'last_name',
						type: 'string',
						default: '',
						description: 'Last name of the contact',
					},
					addCustomFieldDescription('getContactCustomFields'),
				],
			},
		],
	},
	{
		displayName: 'Companies (Link Existing)',
		name: 'companies',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		placeholder: 'Add company',
		options: [
			{
				displayName: 'Company',
				name: 'company',
				values: [
					{
						displayName: 'Company ID',
						name: 'id',
						type: 'number',
						default: 0,
						description: 'ID of existing company to link',
					},
				],
			},
		],
	},
]);

export const description: ILeadsProperties = [
	...addJsonParametersDescription(displayOptions),
	{
		displayName: 'Leads',
		name: 'collection',
		placeholder: 'Add lead',
		type: 'fixedCollection',
		default: [],
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				...displayOptions.show,
				json: [false],
			},
		},
		options: [
			{
				displayName: 'Lead',
				name: 'lead',
				values: createLeadComplexModel,
			},
		],
	},
];


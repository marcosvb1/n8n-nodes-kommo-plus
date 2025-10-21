import { INodeProperties } from 'n8n-workflow';

import * as getLeads from './get';
import * as createLeads from './create';
import * as createLeadsComplex from './createComplex';
import * as updateLeads from './update';
export { getLeads, createLeads, createLeadsComplex, updateLeads };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['leads'],
			},
		},
		options: [
			{
				name: 'Get Lead List',
				value: 'getLeads',
				description: 'Get list of leads',
				action: 'Get list of leads',
			},
			{
				name: 'Create Leads',
				value: 'createLeads',
				description: 'Create new leads',
				action: 'Create new leads',
			},
			{
				name: 'Create Leads Complex',
				value: 'createLeadsComplex',
				description: 'Create leads with new contacts in one request',
				action: 'Create leads with contacts',
			},
			{
				name: 'Update Leads',
				value: 'updateLeads',
				action: 'Update leads',
				description: 'Update leads by ID',
			},
		],
		default: 'getLeads',
	},
	...getLeads.description,
	...createLeads.description,
	...createLeadsComplex.description,
	...updateLeads.description,
];

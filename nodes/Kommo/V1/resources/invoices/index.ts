import { INodeProperties } from 'n8n-workflow';

import * as getInvoices from './get';
import * as createInvoices from './create';
import * as updateInvoices from './update';

export { getInvoices, createInvoices, updateInvoices };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['invoices'],
			},
		},
		options: [
			{
				name: 'Get Invoices',
				value: 'getInvoices',
				description: 'Get list of invoices from invoice catalogs',
				action: 'Get list of invoices',
			},
			{
				name: 'Create Invoice',
				value: 'createInvoices',
				description: 'Create new invoice with items',
				action: 'Create new invoice',
			},
			{
				name: 'Update Invoice',
				value: 'updateInvoices',
				description: 'Update existing invoice',
				action: 'Update invoice',
			},
		],
		default: 'getInvoices',
	},
	...getInvoices.description,
	...createInvoices.description,
	...updateInvoices.description,
];
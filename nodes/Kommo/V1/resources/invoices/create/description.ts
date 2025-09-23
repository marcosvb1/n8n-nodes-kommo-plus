import { IDisplayOptions, INodeProperties } from 'n8n-workflow';
import { IInvoicesProperties } from '../../interfaces';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';
import { invoiceModelDescription } from '../model';
import { addRequestId } from '../../_components/RequestId';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['invoices'],
		operation: ['createInvoices'],
	},
};

export const createInvoiceModel: INodeProperties[] = [
	...invoiceModelDescription.filter((el) => el.name !== 'id'),
	addRequestId(),
];

export const description: IInvoicesProperties = [
	...addJsonParametersDescription(displayOptions),
	{
		displayName: 'Invoices',
		name: 'collection',
		placeholder: 'Add invoice',
		type: 'fixedCollection',
		default: [],
		required: true,
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
				displayName: 'Create Invoice',
				name: 'element',
				values: createInvoiceModel,
			},
		],
	},
];

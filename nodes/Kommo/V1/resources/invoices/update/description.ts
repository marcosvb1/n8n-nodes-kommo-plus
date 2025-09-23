import { IDisplayOptions, INodeProperties } from 'n8n-workflow';
import { IInvoicesProperties } from '../../interfaces';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';
import { invoiceModelDescription } from '../model';
import { addRequestId } from '../../_components/RequestId';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['invoices'],
		operation: ['updateInvoices'],
	},
};

export const updateInvoiceModel: INodeProperties[] = [
	// ID é obrigatório para updates
	{
		displayName: 'ID',
		name: 'id',
		type: 'number',
		default: 0,
		required: true,
		description: 'ID of the invoice to update',
	},
	// Outros campos opcionais
	...invoiceModelDescription
		.filter(field => field.name !== 'id')
		.map(field => ({
			...field,
			required: false, // Tornar não obrigatório
		})),
	addRequestId(),
];

export const description: IInvoicesProperties = [
	...addJsonParametersDescription(displayOptions),
	{
		displayName: 'Invoices',
		name: 'collection',
		placeholder: 'Add invoice to update',
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
				displayName: 'Update Invoice',
				name: 'element',
				values: updateInvoiceModel,
			},
		],
	},
];

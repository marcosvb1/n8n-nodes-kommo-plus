
import { IDisplayOptions, INodeProperties } from 'n8n-workflow';
import { ITransactionsProperties } from '../../interfaces';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';
import { transactionModelDescription } from '../model';
import { addRequestId } from '../../_components/RequestId';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['transactions'],
		operation: ['create'],
	},
};

export const createTransactionModel: INodeProperties[] = [
	...transactionModelDescription.filter((el) => el.name !== 'id'),
	{
		displayName: 'Status Name or ID',
		name: 'status',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getTransactionStatusOptions',
		},
		default: '',
	},
	{
		displayName: 'Existing Contact',
		name: 'existing_contact',
		type: 'boolean',
		default: false,
	},
	{
		displayName: 'Contact Name or ID',
		name: 'contact_id',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getActiveUsers',
		},
		default: '',
		displayOptions: {
			show: {
				existing_contact: [true],
			},
		},
	},
	{
		displayName: 'Buyer Name',
		name: 'buyer_name',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				existing_contact: [false],
			},
		},
	},
	addRequestId(),
];

export const description: ITransactionsProperties = [
	...addJsonParametersDescription(displayOptions),
	{
		displayName: 'Catalog Name or ID',
		name: 'catalog_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getInvoicesCatalogs',
		},
		default: '',
		required: true,
		description: 'Select catalog. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions,
	},
	{
		displayName: 'Transactions',
		name: 'collection',
		placeholder: 'Add transaction',
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
			hide: {
				catalog_id: [''],
			},
		},
		options: [
			{
				displayName: 'Create Transaction',
				name: 'transaction',
				values: createTransactionModel,
			},
		],
	},
];

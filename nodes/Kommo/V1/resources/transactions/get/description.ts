
import { IDisplayOptions } from 'n8n-workflow';
import { ITransactionsProperties } from '../../interfaces';
import { addLimitDescription } from '../../_components/LimitDescription';
import { addPageDescription } from '../../_components/PageDescription';
import { addReturnAll } from '../../_components/ReturnAllDescription';
import { addFilterDescription } from '../../_components/FilterDescription';
import { addSortDescription } from '../../_components/SortDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['transactions'],
		operation: ['get'],
	},
};

export const description: ITransactionsProperties = [
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
		options: [
			addSortDescription(undefined, [
				{
					name: 'ID',
					value: 'id',
				},
			]),
		],
	},
	addPageDescription({
		show: {
			...displayOptions.show,
			returnAll: [false],
		},
	}),
	addLimitDescription(displayOptions),
	{
		displayName: 'Simplify Output',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response',
		displayOptions,
	},
	addFilterDescription(displayOptions, [
		{
			displayName: 'Query',
			name: 'query',
			type: 'string',
			default: '',
			description: 'Search query',
		},
		{
			displayName: 'List of Transaction IDs',
			name: 'id',
			type: 'string',
			default: '',
			description: 'Transaction IDs separated by commas',
		},
	]),
];

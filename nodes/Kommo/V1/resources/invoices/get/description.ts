import { IDisplayOptions } from 'n8n-workflow';
import { IInvoicesProperties } from '../../interfaces';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';
import { addFilterDescription } from '../../_components/FilterDescription';
import { addCustomFieldDescription } from '../../_components/CustomFieldsDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['invoices'],
		operation: ['getInvoices'],
	},
};

export const description: IInvoicesProperties = [
	...addJsonParametersDescription(displayOptions),
	addFilterDescription(displayOptions, [
		{
			displayName: 'IDs',
			name: 'id',
			type: 'string',
			default: '',
			description: 'IDs de invoices separados por vírgula',
		},
		{
			displayName: 'Created At',
			name: 'created_at',
			type: 'fixedCollection',
			default: {},
			options: [
				{
					displayName: 'Range',
					name: 'dateRangeCustomProperties',
					values: [
						{ displayName: 'From', name: 'from', type: 'string', default: '' },
						{ displayName: 'To', name: 'to', type: 'string', default: '' },
					],
				},
			],
		},
		{
			displayName: 'Updated At',
			name: 'updated_at',
			type: 'fixedCollection',
			default: {},
			options: [
				{
					displayName: 'Range',
					name: 'dateRangeCustomProperties',
					values: [
						{ displayName: 'From', name: 'from', type: 'string', default: '' },
						{ displayName: 'To', name: 'to', type: 'string', default: '' },
					],
				},
			],
		},
		// Custom fields (catálogo de invoices)
		{
			displayName: 'Custom Fields',
			name: 'custom_fields_values',
			type: 'fixedCollection',
			placeholder: 'Add custom field filter',
			default: {},
			typeOptions: { multipleValues: true },
			options: [
				{
					displayName: 'Custom Field',
					name: 'custom_field',
					values: [
						{
							displayName: 'Field Name or ID',
							name: 'data',
							type: 'options',
							description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
							typeOptions: { loadOptionsMethod: 'getPurchaseCatalogCustomFields' },
							default: '',
							required: true,
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'string',
							default: '',
						},
					],
				},
			],
		},
	]),
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions,
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...displayOptions.show,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];

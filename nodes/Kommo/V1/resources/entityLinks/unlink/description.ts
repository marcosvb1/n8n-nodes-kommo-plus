import { IDisplayOptions } from 'n8n-workflow';
import { IEntityLinksProperties } from '../../interfaces';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['entityLinks'],
		operation: ['unlink'],
	},
};

export const description: IEntityLinksProperties = [
	...addJsonParametersDescription(displayOptions),
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		required: true,
		default: 'leads',
		description: 'Type of the main entity',
		displayOptions: {
			show: {
				...displayOptions.show,
				json: [false],
			},
		},
		options: [
			{ name: 'Lead', value: 'leads' },
			{ name: 'Contact', value: 'contacts' },
			{ name: 'Company', value: 'companies' },
			{ name: 'Customer', value: 'customers' },
		],
	},
	{
		displayName: 'Unlinks',
		name: 'unlinks',
		placeholder: 'Add unlink',
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
				displayName: 'Unlink',
				name: 'unlink',
				values: [
					{
						displayName: 'Entity ID',
						name: 'entity_id',
						type: 'number',
						default: 0,
						required: true,
						description: 'ID of the main entity',
					},
					{
						displayName: 'To Entity ID',
						name: 'to_entity_id',
						type: 'number',
						default: 0,
						required: true,
						description: 'ID of the entity to unlink from',
					},
					{
						displayName: 'To Entity Type',
						name: 'to_entity_type',
						type: 'options',
						default: 'contacts',
						required: true,
						description: 'Type of the entity to unlink from',
						options: [
							{
								name: 'Catalog Element',
								value: 'catalog_elements',
							},
							{
								name: 'Company',
								value: 'companies',
							},
							{
								name: 'Contact',
								value: 'contacts',
							},
							{
								name: 'Customer',
								value: 'customers',
							},
							{
								name: 'Lead',
								value: 'leads',
							},
						],
					},
					{
						displayName: 'Metadata',
						name: 'metadata',
						type: 'collection',
						placeholder: 'Add metadata',
						default: {},
						description: 'Optional metadata (required for catalog elements)',
						options: [
							{
								displayName: 'Catalog Name or ID',
								name: 'catalog_id',
								type: 'options',
								default: '',
								description:
									'Catalog ID (required for catalog elements). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
								typeOptions: {
									loadOptionsMethod: 'getCatalogs',
								},
							},
							{
								displayName: 'Updated By User Name or ID',
								name: 'updated_by',
								type: 'options',
								default: 0,
								description:
									'User who performs the unlink. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
								typeOptions: {
									loadOptionsMethod: 'getActiveUsers',
								},
							},
						],
					},
				],
			},
		],
	},
];
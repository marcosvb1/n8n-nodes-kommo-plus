import { IDisplayOptions } from 'n8n-workflow';
import { IEntityLinksProperties } from '../../interfaces';
import { addReturnAll } from '../../_components/ReturnAllDescription';
import { addPageDescription } from '../../_components/PageDescription';
import { addLimitDescription } from '../../_components/LimitDescription';
import { addFilterDescription } from '../../_components/FilterDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['entityLinks'],
		operation: ['get'],
	},
};

export const description: IEntityLinksProperties = [
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		required: true,
		default: 'leads',
		description: 'Type of the main entity',
		displayOptions,
		options: [
			{ name: 'Lead', value: 'leads' },
			{ name: 'Contact', value: 'contacts' },
			{ name: 'Company', value: 'companies' },
			{ name: 'Customer', value: 'customers' },
		],
	},
	{
		displayName: 'Entity ID',
		name: 'entity_id',
		type: 'number',
		required: true,
		default: 0,
		description: 'ID of the entity to get links for',
		displayOptions,
	},
	addFilterDescription(displayOptions, [
		{
			displayName: 'To Entity Type',
			name: 'to_entity_type',
			type: 'options',
			default: '',
			description: 'Filter by linked entity type',
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
			displayName: 'To Entity ID',
			name: 'to_entity_id',
			type: 'number',
			default: 0,
			description: 'Filter by linked entity ID',
		},
	]),
	addReturnAll(displayOptions),
	addPageDescription({
		show: {
			...displayOptions.show,
			returnAll: [false],
		},
	}),
	addLimitDescription(displayOptions),
];
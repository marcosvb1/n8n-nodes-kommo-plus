import { IDisplayOptions, INodeProperties } from 'n8n-workflow';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhooks'],
		operation: ['get'],
	},
};

export const description: INodeProperties[] = [
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
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions,
		options: [
			{
				displayName: 'Filter by Status',
				name: 'disabled',
				type: 'options',
				options: [
					{
						name: 'All',
						value: '',
						description: 'Return both active and disabled webhooks',
					},
					{
						name: 'Active Only',
						value: false,
						description: 'Return only active webhooks',
					},
					{
						name: 'Disabled Only',
						value: true,
						description: 'Return only disabled webhooks',
					},
				],
				default: false,
				description: 'Filter webhooks by their status',
			},
			{
				displayName: 'Include Recent Events',
				name: 'includeRecentEvents',
				type: 'boolean',
				default: false,
				description: 'Whether to include information about recent webhook deliveries',
			},
			{
				displayName: 'Include Statistics',
				name: 'includeStats',
				type: 'boolean',
				default: false,
				description: 'Whether to include delivery statistics for each webhook',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{
						name: 'Created Date',
						value: 'created_at',
						description: 'Sort by creation date',
					},
					{
						name: 'Updated Date',
						value: 'updated_at',
						description: 'Sort by last update date',
					},
					{
						name: 'Destination URL',
						value: 'destination',
						description: 'Sort by destination URL alphabetically',
					},
					{
						name: 'Status',
						value: 'disabled',
						description: 'Sort by status (active first)',
					},
				],
				default: 'created_at',
				description: 'Field to sort webhooks by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
						description: 'Sort in ascending order',
					},
					{
						name: 'Descending',
						value: 'desc',
						description: 'Sort in descending order',
					},
				],
				default: 'desc',
				description: 'Sort order for the results',
			},
		],
	},
];

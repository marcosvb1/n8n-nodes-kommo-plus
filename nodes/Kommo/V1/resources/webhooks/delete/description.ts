import { IDisplayOptions, INodeProperties } from 'n8n-workflow';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhooks'],
		operation: ['delete'],
	},
};

export const description: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'The ID of the webhook to delete. You can get this from the "Get Webhooks" operation.',
		displayOptions,
	},
	{
		displayName: 'Confirm Deletion',
		name: 'confirmDeletion',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Whether to confirm that you want to permanently delete this webhook. This action cannot be undone.',
		displayOptions,
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
				displayName: 'Backup Webhook Info',
				name: 'backupInfo',
				type: 'boolean',
				default: true,
				description: 'Whether to retrieve and include webhook information in the response before deletion',
			},
			{
				displayName: 'Force Delete',
				name: 'forceDelete',
				type: 'boolean',
				default: false,
				description: 'Whether to force deletion even if webhook has active dependencies (use with caution)',
			},
			{
				displayName: 'Notify on Success',
				name: 'notifySuccess',
				type: 'boolean',
				default: false,
				description: 'Whether to include detailed success information in the response',
			},
		],
	},
];

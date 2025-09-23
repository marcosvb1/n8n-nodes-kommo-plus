import { INodeProperties } from 'n8n-workflow';

import * as create from './create';
import * as get from './get';
import * as deleteWebhook from './delete';

export { create, get, deleteWebhook as delete };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhooks'],
			},
		},
		options: [
			{
				name: 'Create Webhook',
				value: 'create',
				description: 'Create a new webhook to receive events from Kommo',
				action: 'Create a webhook',
			},
			{
				name: 'Get Webhooks',
				value: 'get',
				description: 'Retrieve list of existing webhooks',
				action: 'Get webhooks',
			},
			{
				name: 'Delete Webhook',
				value: 'delete',
				description: 'Delete an existing webhook',
				action: 'Delete a webhook',
			},
		],
		default: 'create',
	},
	...create.description,
	...get.description,
	...deleteWebhook.description,
];

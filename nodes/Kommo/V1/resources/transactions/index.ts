
import { INodeProperties } from 'n8n-workflow';

import * as get from './get';
import * as create from './create';
import * as update from './update';

export { get, create, update };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transactions'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a transaction',
				description: 'Create a transaction',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get transactions',
				description: 'Get transactions',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a transaction',
				description: 'Update a transaction',
			},
		],
		default: 'get',
	},
	...get.description,
	...create.description,
	...update.description,
];

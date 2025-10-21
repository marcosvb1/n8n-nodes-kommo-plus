import { INodeProperties } from 'n8n-workflow';

import * as get from './get';
import * as link from './link';
import * as unlink from './unlink';

export { get, link, unlink };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['entityLinks'],
			},
		},
		options: [
			{
				name: 'Get Links',
				value: 'get',
				description: 'Get links between entities',
				action: 'Get entity links',
			},
			{
				name: 'Link Entities',
				value: 'link',
				description: 'Link entities together',
				action: 'Link entities',
			},
			{
				name: 'Unlink Entities',
				value: 'unlink',
				action: 'Unlink entities',
			},
		],
		default: 'get',
	},
	...get.description,
	...link.description,
	...unlink.description,
];


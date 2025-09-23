import { INodeProperties } from 'n8n-workflow';

import * as get from './methods/get';
import * as summary from './methods/summary';
import * as create from './methods/createForms';
import * as accept from './methods/accept';
import * as link from './methods/link';
import * as reject from './methods/reject';
export { get, summary, create, accept, link, reject };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['unsorted'],
			},
		},
		options: [
			{
				name: 'Aceitar',
				value: 'accept',
				description: 'Aceitar uma lead de entrada pelo UID',
				action: 'Aceitar unsorted por UID',
			},
			{
				name: 'Criar (Formulários)',
				value: 'create',
				description: 'Criar leads de entrada do tipo formulários',
				action: 'Criar unsorted forms',
			},
			{
				name: 'Listar',
				value: 'get',
				description: 'Listar leads de entrada (unsorted)',
				action: 'Listar unsorted',
			},
			{
				name: 'Rejeitar',
				value: 'reject',
				description: 'Rejeitar uma lead de entrada pelo UID',
				action: 'Rejeitar unsorted por UID',
			},
			{
				name: 'Resumo',
				value: 'summary',
				description: 'Obter resumo de unsorted',
				action: 'Obter resumo de unsorted',
			},
			{
				name: 'Vincular',
				value: 'link',
				description: 'Vincular um unsorted (tipo chat) a uma entidade',
				action: 'Vincular unsorted por UID',
			},
		],
		default: 'get',
	},
	...get.description,
	...create.description,
	...summary.description,
	...accept.description,
	...link.description,
	...reject.description,
];



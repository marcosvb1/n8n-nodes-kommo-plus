import { IDisplayOptions } from 'n8n-workflow';
import { IUnsortedProperties } from '../../../interfaces';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['unsorted'],
		operation: ['summary'],
	},
};

export const description: IUnsortedProperties = [
	{
		displayName: 'Categoria',
		name: 'category',
		type: 'options',
		default: 'forms',
		description: 'Categoria de unsorted para o resumo',
		options: [
			{ name: 'Formulários', value: 'forms' },
			{ name: 'Chats', value: 'chats' },
			{ name: 'SIP', value: 'sip' },
			{ name: 'E‑mail', value: 'mail' },
		],
		displayOptions,
	},
];



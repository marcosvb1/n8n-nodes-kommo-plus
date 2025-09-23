import { IDisplayOptions } from 'n8n-workflow';
import { IUnsortedProperties } from '../../../interfaces';
import { addReturnAll } from '../../../_components/ReturnAllDescription';
import { addPageDescription } from '../../../_components/PageDescription';
import { addLimitDescription } from '../../../_components/LimitDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['unsorted'],
		operation: ['get'],
	},
};

export const description: IUnsortedProperties = [
	addReturnAll(displayOptions),
	{
		displayName: 'Categoria',
		name: 'category',
		type: 'options',
		default: 'forms',
		description: 'Categoria de unsorted a listar',
		options: [
			{ name: 'Formulários', value: 'forms' },
			{ name: 'Chats', value: 'chats' },
			{ name: 'SIP', value: 'sip' },
			{ name: 'E‑mail', value: 'mail' },
		],
		displayOptions,
	},
	addPageDescription({
		show: { ...displayOptions.show, returnAll: [false] },
	}),
	addLimitDescription(displayOptions),
];



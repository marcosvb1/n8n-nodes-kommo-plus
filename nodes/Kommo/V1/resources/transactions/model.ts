
import { INodeProperties } from 'n8n-workflow';
import { addCustomFieldDescription } from '../_components/CustomFieldsDescription';

export const transactionModelDescription: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		type: 'number',
		default: 0,
		required: true,
	},
	{
		displayName: 'Purchase Title',
		name: 'name',
		type: 'string',
		default: '',
	},
	addCustomFieldDescription('getTransactionCustomFields'),
];

import { IDisplayOptions } from 'n8n-workflow';
import { IListsProperties } from '../../interfaces';
import { addLimitDescription } from '../../_components/LimitDescription';
import { addPageDescription } from '../../_components/PageDescription';
import { addReturnAll } from '../../_components/ReturnAllDescription';
import { addSortDescription } from '../../_components/SortDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['lists'],
		operation: ['getLists'],
	},
};

export const description: IListsProperties = [
	addReturnAll(displayOptions),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		description: 'Add options for the request',
		displayOptions,
		options: [
			addSortDescription(undefined, [
				{
					name: 'ID',
					value: 'id',
				},
			]),
			addPageDescription({
				show: {
					...displayOptions.show,
					returnAll: [false],
				},
			}),
			addLimitDescription(displayOptions),
		],
	},
	{
		displayName: 'Simplify Output',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response',
		displayOptions,
	},
];

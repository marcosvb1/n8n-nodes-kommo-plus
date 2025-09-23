import { IDisplayOptions } from 'n8n-workflow';
import { IListsProperties } from '../../interfaces';
import { addLimitDescription } from '../../_components/LimitDescription';
import { addPageDescription } from '../../_components/PageDescription';
import { addReturnAll } from '../../_components/ReturnAllDescription';

const displayOptions: IDisplayOptions | undefined = {
	show: {
		resource: ['lists'],
		operation: ['getLists'],
	},
};

export const description: IListsProperties = [
	addReturnAll(displayOptions),
  {
    displayName: 'Simplify Output',
    name: 'simplify',
    type: 'boolean',
    default: true,
    description: 'Whether to return only the catalogs array instead of the full response',
    displayOptions,
  },
	addPageDescription({
		show: {
			...displayOptions.show,
			returnAll: [false],
		},
	}),
	addLimitDescription(displayOptions),
];

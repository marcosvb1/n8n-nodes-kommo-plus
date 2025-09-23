import { IDisplayOptions } from 'n8n-workflow';
import { ICustomersProperties } from '../../interfaces';
import { addDateRangeDescription } from '../../_components/DateRangeDescription';
import { addFilterDescription } from '../../_components/FilterDescription';
import { addLimitDescription } from '../../_components/LimitDescription';
import { addPageDescription } from '../../_components/PageDescription';
import { addReturnAll } from '../../_components/ReturnAllDescription';
import { addSortDescription } from '../../_components/SortDescription';

const displayOptions: IDisplayOptions | undefined = {
  show: {
    resource: ['customers'],
    operation: ['getCustomers'],
  },
};

export const description: ICustomersProperties = [
  addReturnAll(displayOptions),
  addFilterDescription(displayOptions, [
    {
      displayName: 'Query',
      name: 'query',
      type: 'string',
      default: '',
      description: 'Search query',
    },
    {
      displayName: 'List of Customer IDs',
      name: 'id',
      type: 'string',
      default: '',
      description: 'Customer IDs separated by commas',
    },
    {
      displayName: 'Created by Users',
      name: 'created_by',
      type: 'multiOptions',
      default: [],
      typeOptions: {
        loadOptionsMethod: 'getActiveUsers',
      },
      description:
        'Select users. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      noDataExpression: true,
    },
    {
      displayName: 'Updated by Users',
      name: 'updated_by',
      type: 'multiOptions',
      default: [],
      typeOptions: {
        loadOptionsMethod: 'getActiveUsers',
      },
      description:
        'Select users. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      noDataExpression: true,
    },
    addDateRangeDescription('Created at', 'created_at'),
    addDateRangeDescription('Updated at', 'updated_at'),
  ]),
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: { sortSettings: { sort_by: 'created_at', sort_order: 'asc' } },
    displayOptions,
    options: [
      addSortDescription(undefined, [
        { name: 'Date Update', value: 'updated_at' },
        { name: 'ID', value: 'id' },
      ]),
    ],
  },
  {
    displayName: 'Simplify Output',
    name: 'simplify',
    type: 'boolean',
    default: true,
    description: 'Whether to return only the customers array instead of the full response',
    displayOptions,
  },
  addPageDescription({
    show: { ...displayOptions.show, returnAll: [false] },
  }),
  addLimitDescription(displayOptions),
];



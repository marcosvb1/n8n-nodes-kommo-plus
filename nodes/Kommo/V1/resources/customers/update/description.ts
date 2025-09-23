import { IDisplayOptions, INodeProperties } from 'n8n-workflow';
import { ICustomersProperties } from '../../interfaces';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';
import { addCustomFieldDescription } from '../../_components/CustomFieldsDescription';

const displayOptions: IDisplayOptions | undefined = {
  show: {
    resource: ['customers'],
    operation: ['updateCustomers'],
  },
};

const updateCustomerModel: INodeProperties[] = [
  { displayName: 'ID', name: 'id', type: 'number', default: 0, required: true },
  { displayName: 'Name', name: 'name', type: 'string', default: '' },
  {
    displayName: 'Responsible User Name or ID',
    name: 'responsible_user_id',
    type: 'options',
    default: '',
    typeOptions: { loadOptionsMethod: 'getActiveUsersWithRobot' },
    description:
      'Select user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  addCustomFieldDescription('getCustomerCustomFields'),
  {
    displayName: 'Embedded',
    name: '_embedded',
    placeholder: 'Add embedded',
    type: 'fixedCollection',
    default: {},
    typeOptions: { multipleValues: true },
    options: [
      {
        displayName: 'Tags',
        name: 'tags',
        values: [
          {
            displayName: 'Tag Names or IDs',
            name: 'id',
            type: 'multiOptions',
            default: [],
            typeOptions: { loadOptionsMethod: 'getTags' },
            description:
              'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
          },
        ],
      },
    ],
  },
];

export const description: ICustomersProperties = [
  ...addJsonParametersDescription(displayOptions),
  {
    displayName: 'Customers',
    name: 'collection',
    placeholder: 'Add customer',
    type: 'fixedCollection',
    default: [],
    typeOptions: { multipleValues: true },
    displayOptions: { show: { ...displayOptions.show, json: [false] } },
    options: [
      { displayName: 'Customer', name: 'customer', values: updateCustomerModel },
    ],
  },
];



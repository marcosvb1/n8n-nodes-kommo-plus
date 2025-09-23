import { INodeProperties } from 'n8n-workflow';

import * as getCustomers from './get';
import * as createCustomers from './create';
import * as updateCustomers from './update';
import * as setCustomersMode from './mode';
export { getCustomers, createCustomers, updateCustomers, setCustomersMode };

export const descriptions: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['customers'],
      },
    },
    options: [
      {
        name: 'Get Customers List',
        value: 'getCustomers',
        description: 'Get list of customers',
        action: 'Get list of customers',
      },
      {
        name: 'Create Customers',
        value: 'createCustomers',
        description: 'Create new customers',
        action: 'Create new customers',
      },
      {
        name: 'Update Customers',
        value: 'updateCustomers',
        description: 'Update customers by ID',
        action: 'Update customers',
      },
      {
        name: 'Set Customers Mode',
        value: 'setCustomersMode',
        description: 'Enable/disable customers and set mode',
        action: 'Set customers mode',
      },
    ],
    default: 'getCustomers',
  },
  ...getCustomers.description,
  ...createCustomers.description,
  ...updateCustomers.description,
  ...setCustomersMode.description,
];



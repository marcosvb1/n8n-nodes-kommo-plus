import { IDisplayOptions } from 'n8n-workflow';
import { ICustomersProperties } from '../../interfaces';

const displayOptions: IDisplayOptions | undefined = {
  show: {
    resource: ['customers'],
    operation: ['setCustomersMode'],
  },
};

export const description: ICustomersProperties = [
  {
    displayName: 'Mode',
    name: 'mode',
    type: 'options',
    default: 'segments',
    options: [
      { name: 'Segments', value: 'segments' },
      { name: 'Retail', value: 'retail' },
    ],
    description: 'Select customers mode',
    displayOptions,
  },
  {
    displayName: 'Is Enabled',
    name: 'is_enabled',
    type: 'boolean',
    default: true,
    description: 'Whether to enable customers for the selected mode',
    displayOptions,
  },
];



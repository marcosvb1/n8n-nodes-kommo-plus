import { IDisplayOptions } from 'n8n-workflow';
import { IUnsortedProperties } from '../../../interfaces';

const displayOptions: IDisplayOptions | undefined = {
  show: {
    resource: ['unsorted'],
    operation: ['link'],
  },
};

export const description: IUnsortedProperties = [
  {
    displayName: 'UID',
    name: 'uid',
    type: 'string',
    default: '',
    required: true,
    description: 'UID do item no Unsorted (somente chats suportados)',
    displayOptions,
  },
  {
    displayName: 'Tipo Da Entidade',
    name: 'entity_type',
    type: 'options',
    default: 'leads',
    options: [
      { name: 'Leads', value: 'leads' },
      { name: 'Clientes', value: 'customers' },
    ],
    displayOptions,
  },
  {
    displayName: 'ID Da Entidade',
    name: 'entity_id',
    type: 'number',
    default: 0,
    required: true,
    displayOptions,
  },
  {
    displayName: 'ID Do Usuário',
    name: 'user_id',
    type: 'number',
    default: 0,
    description: 'ID do usuário que executa a vinculação (opcional)',
    displayOptions,
  },
];



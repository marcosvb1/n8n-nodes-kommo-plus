import { IDisplayOptions } from 'n8n-workflow';
import { IUnsortedProperties } from '../../../interfaces';

const displayOptions: IDisplayOptions | undefined = {
  show: {
    resource: ['unsorted'],
    operation: ['accept'],
  },
};

export const description: IUnsortedProperties = [
  {
    displayName: 'UID',
    name: 'uid',
    type: 'string',
    default: '',
    required: true,
    description: 'UID do item no Unsorted a ser aceito',
    displayOptions,
  },
  {
    displayName: 'ID Do Usuário',
    name: 'user_id',
    type: 'number',
    default: 0,
    description: 'ID do usuário que aceitará o item (opcional)',
    displayOptions,
  },
  {
    displayName: 'ID Do Status',
    name: 'status_id',
    type: 'number',
    default: 0,
    description: 'Status de destino da lead aceita (opcional)',
    displayOptions,
  },
];



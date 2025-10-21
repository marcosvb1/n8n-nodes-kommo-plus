import { IDisplayOptions } from 'n8n-workflow';
import { IUnsortedProperties } from '../../../interfaces';
import { addJsonParametersDescription } from '../../../_components/JsonParametersDescription';
import { addCustomFieldDescription } from '../../../_components/CustomFieldsDescription';

const displayOptions: IDisplayOptions | undefined = {
  show: {
    resource: ['unsorted'],
    operation: ['create'],
  },
};

export const description: IUnsortedProperties = [
  ...addJsonParametersDescription(displayOptions),
  {
    displayName: 'Itens',
    name: 'items',
    placeholder: 'Adicionar Item',
    type: 'fixedCollection',
    default: [],
    typeOptions: {
      multipleValues: true,
    },
    displayOptions: {
      show: {
        ...displayOptions.show,
        json: [false],
      },
    },
    options: [
      {
        displayName: 'Item',
        name: 'item',
        values: [
							{
								displayName: 'Criado Em',
								name: 'created_at',
								type: 'dateTime',
								default: '',
							},
							{
								displayName: 'Embutidos',
								name: '_embedded',
								type: 'collection',
								default: {},
								options: [
											{
												displayName: 'Lead',
												name: 'lead',
												type: 'collection',
												default: {},
												placeholder: 'Adicionar campo',
												options: [
													{
														displayName: 'Nome',
														name: 'name',
														type: 'string',
														default: '',
													},
													{
														displayName: 'Preço',
														name: 'price',
														type: 'number',
														default: 0
													},
													{
														displayName: 'Visitor UID',
														name: 'visitor_uid',
														type: 'string',
														default: '',
													},
													{
														displayName: 'Tags (Separadas Por Vírgula)',
														name: 'tags',
														type: 'string',
														default: '',
													},
												]
											},
											{
												displayName: 'Contato',
												name: 'contact',
												type: 'collection',
												default: {},
												placeholder: 'Adicionar campo',
												options: [
													{
														displayName: 'Nome',
														name: 'name',
														type: 'string',
														default: '',
													},
													{
														displayName: 'Primeiro Nome',
														name: 'first_name',
														type: 'string',
														default: '',
														description: 'Ex.:	Maria',
													},
													{
														displayName: 'Sobrenome',
														name: 'last_name',
														type: 'string',
														default: '',
														description: 'Ex.:	Silva',
													},
													]
											},
											{
												displayName: 'Empresa',
												name: 'company',
												type: 'collection',
												default: {},
												placeholder: 'Adicionar campo',
												options: [
													{
														displayName: 'Nome',
														name: 'name',
														type: 'string',
														default: '',
													},
													]
											},
									]
							},
							{
								displayName: 'ID Da Requisição',
								name: 'request_id',
								type: 'string',
								default: '',
								description: 'Retornado no response;	não	é	armazenado',
							},
							{
								displayName: 'Pipeline Name or ID',
								name: 'pipeline_id',
								type: 'options',
								description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
								default: '',
								typeOptions: {
									loadOptionsMethod: 'getPipelines',
								},
							},
							{
								displayName: 'Metadados',
								name: 'metadata',
								placeholder: 'Adicionar campo',
								type: 'fixedCollection',
								default: {},
								options: [
											{
												displayName: 'Campos',
												name: 'fields',
													values: [
												{
													displayName: 'Enviado Em',
													name: 'form_sent_at',
													type: 'dateTime',
													default: '',
												},
												{
													displayName: 'ID Do Formulário',
													name: 'form_id',
													type: 'string',
													default: '',
												},
												{
													displayName: 'IP',
													name: 'ip',
													type: 'string',
													default: '',
												},
												{
													displayName: 'Nome Do Formulário',
													name: 'form_name',
													type: 'string',
													default: '',
												},
												{
													displayName: 'Página Do Formulário',
													name: 'form_page',
													type: 'string',
													default: '',
												},
												{
													displayName: 'Referenciador (Referer)',
													name: 'referer',
													type: 'string',
													default: '',
												},
											]
											},
									],
								description: 'Metadados do formulário conforme a documentação',
							},
							{
								displayName: 'Nome Da Fonte',
								name: 'source_name',
								type: 'string',
								default: '',
									required:	true,
							},
							{
								displayName: 'UID Da Fonte',
								name: 'source_uid',
								type: 'string',
								default: '',
									required:	true,
							},
					],
      },
    ],
  },
];



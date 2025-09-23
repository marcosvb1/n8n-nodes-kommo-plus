import { IDisplayOptions, INodeProperties } from 'n8n-workflow';
import { addJsonParametersDescription } from '../../_components/JsonParametersDescription';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhooks'],
		operation: ['create'],
	},
};

export const description: INodeProperties[] = [
	...addJsonParametersDescription(displayOptions),
	{
		displayName: 'Destination URL',
		name: 'destination',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://your-server.com/webhook/kommo',
		description: 'The URL where Kommo will send webhook events. Must be accessible from the internet.',
		displayOptions: {
			show: {
				...displayOptions.show,
				json: [false],
			},
		},
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		required: true,
		options: [
			{
				name: 'Company Added',
				value: 'company_added',
				description: 'Trigger when a new company is created',
			},
			{
				name: 'Company Deleted',
				value: 'company_deleted',
				description: 'Trigger when a company is deleted',
			},
			{
				name: 'Company Updated',
				value: 'company_updated',
				description: 'Trigger when a company is modified',
			},
			{
				name: 'Contact Added',
				value: 'contact_added',
				description: 'Trigger when a new contact is created',
			},
			{
				name: 'Contact Deleted',
				value: 'contact_deleted',
				description: 'Trigger when a contact is deleted',
			},
			{
				name: 'Contact Updated',
				value: 'contact_updated',
				description: 'Trigger when a contact is modified',
			},
			{
				name: 'Lead Added',
				value: 'lead_added',
				description: 'Trigger when a new lead is created',
			},
			{
				name: 'Lead Deleted',
				value: 'lead_deleted',
				description: 'Trigger when a lead is deleted',
			},
			{
				name: 'Lead Updated',
				value: 'lead_updated',
				description: 'Trigger when a lead is modified',
			},
			{
				name: 'Purchase Added',
				value: 'purchase_added',
				description: 'Trigger when a new purchase is created',
			},
			{
				name: 'Purchase Deleted',
				value: 'purchase_deleted',
				description: 'Trigger when a purchase is deleted',
			},
			{
				name: 'Purchase Updated',
				value: 'purchase_updated',
				description: 'Trigger when a purchase is modified',
			},
			{
				name: 'Task Added',
				value: 'task_added',
				description: 'Trigger when a new task is created',
			},
			{
				name: 'Task Deleted',
				value: 'task_deleted',
				description: 'Trigger when a task is deleted',
			},
			{
				name: 'Task Updated',
				value: 'task_updated',
				description: 'Trigger when a task is modified',
			},
		],
		default: ['lead_added', 'lead_updated'],
		description: 'Select which events should trigger this webhook',
		displayOptions: {
			show: {
				...displayOptions.show,
				json: [false],
			},
		},
	},
	{
		displayName: 'Secret Key',
		name: 'secretKey',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		placeholder: 'Generate a secure random string',
		description: 'Optional secret key for webhook signature validation. Highly recommended for production use.',
		displayOptions: {
			show: {
				...displayOptions.show,
				json: [false],
			},
		},
	},
	{
		displayName: 'Disabled',
		name: 'disabled',
		type: 'boolean',
		default: false,
		description: 'Whether to create the webhook in disabled state. Can be enabled later.',
		displayOptions: {
			show: {
				...displayOptions.show,
				json: [false],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				...displayOptions.show,
				json: [false],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: 'Webhook for n8n integration',
				description: 'Optional description for the webhook to help identify its purpose',
			},
			{
				displayName: 'Include Entity Data',
				name: 'includeEntityData',
				type: 'boolean',
				default: true,
				description: 'Whether to include full entity data in webhook payload',
			},
			{
				displayName: 'Retry Attempts',
				name: 'retryAttempts',
				type: 'number',
				default: 3,
				description: 'Number of retry attempts if webhook fails',
				typeOptions: {
					minValue: 0,
					maxValue: 10,
				},
			},
			{
				displayName: 'Sort Order',
				name: 'sort',
				type: 'number',
				default: 1,
				description: 'Sort order for webhook execution when multiple webhooks exist',
				typeOptions: {
					minValue: 1,
					maxValue: 999,
				},
			},
			{
				displayName: 'Timeout (Seconds)',
				name: 'timeout',
				type: 'number',
				default: 30,
				description: 'Maximum time to wait for webhook response',
				typeOptions: {
					minValue: 5,
					maxValue: 300,
				},
			},
		],
	},
];

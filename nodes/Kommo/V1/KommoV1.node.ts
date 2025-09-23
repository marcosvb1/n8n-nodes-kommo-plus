/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import {
	IExecuteFunctions,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
} from 'n8n-workflow';
import * as loadOptions from './methods';
import { router } from './resources/router';

import * as account from './resources/account';
import * as contacts from './resources/contacts';
import * as leads from './resources/leads';
import * as tasks from './resources/tasks';
import * as companies from './resources/companies';
import * as notes from './resources/notes';
import * as lists from './resources/lists';
import * as invoices from './resources/invoices';
import * as unsorted from './resources/unsorted';
import * as customers from './resources/customers';
import * as transactions from './resources/transactions';
import * as webhooks from './resources/webhooks';

export class KommoV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			displayName: 'Kommo+',
			name: 'kommo',
			icon: 'file:kommo_logo.svg',
			group: ['output'],
			version: 1,
			subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
			description: 'Enhanced Kommo API integration with advanced features',
			defaults: {
				name: 'Kommo+ API Node',
			},
			inputs: ['main'] as any,
			outputs: ['main'] as any,
			credentials: [
				{
					name: 'kommoLongLivedApi',
					required: true,
					displayOptions: {
						show: {
							authentication: ['longLivedToken'],
						},
					},
					testedBy: {
						request: {
							method: 'GET',
							url: 'account',
						},
					},
				},
				{
					name: 'kommoOAuth2Api',
					required: true,
					displayOptions: {
						show: {
							authentication: ['oAuth2'],
						},
					},
				},
			],
			properties: [
				{
					displayName: 'Authentication',
					name: 'authentication',
					type: 'options',
					options: [
						{
							name: 'Long Lived Token',
							value: 'longLivedToken',
						},
						{
							name: 'OAuth2',
							value: 'oAuth2',
						},
					],
					default: 'longLivedToken',
				},
				{
					displayName: 'Simplify Output',
					name: 'simplify',
					type: 'boolean',
					default: true,
					description: 'Whether to return simplified arrays/objects instead of raw API envelopes',
				},
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Company', value: 'companies' },
					{ name: 'Contact', value: 'contacts' },
					{ name: 'Customer', value: 'customers' },
					{ name: 'Invoice', value: 'invoices' },
					{ name: 'Lead', value: 'leads' },
					{ name: 'List', value: 'lists' },
					{ name: 'Note', value: 'notes' },
					{ name: 'Task', value: 'tasks' },
					{ name: 'Transaction', value: 'transactions' },
					{ name: 'Unsorted', value: 'unsorted' },
					{ name: 'Webhook', value: 'webhooks' },
				],
					default: 'account',
				},
				...account.descriptions,
				...companies.descriptions,
				...contacts.descriptions,
				...leads.descriptions,
				...tasks.descriptions,
				...notes.descriptions,
				...lists.descriptions,
				...invoices.descriptions,
				...unsorted.descriptions,
				...customers.descriptions,
				...transactions.descriptions,
				...webhooks.descriptions,
			],
		};
	}

	methods = { loadOptions };

	async execute(this: IExecuteFunctions) {
		return router.call(this);
	}
}

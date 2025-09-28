import { IDataObject, INodeExecutionData, IExecuteFunctions, NodeApiError, NodeOperationError } from 'n8n-workflow';
import { IKommo } from './interfaces';

import * as account from './account';
import * as contacts from './contacts';
import * as leads from './leads';
import * as tasks from './tasks';
import * as companies from './companies';
import * as notes from './notes';
import * as lists from './lists';
import * as invoices from './invoices';
import * as unsorted from './unsorted';
import * as customers from './customers';
import * as transactions from './transactions';
import * as webhooks from './webhooks';

function simplifyPayload(payload: any): any {
	if (Array.isArray(payload)) return payload.map(simplifyPayload);
	if (!payload || typeof payload !== 'object') return payload;

	// Extract main embedded arrays if present
	if (payload._embedded && typeof payload._embedded === 'object') {
		const embedded = payload._embedded as Record<string, any>;
		const firstKey = Object.keys(embedded)[0];
		if (firstKey && Array.isArray(embedded[firstKey])) {
			return embedded[firstKey].map((el: any) => simplifyPayload(el));
		}
	}

	// Remove noise keys
	const { _links, _embedded, ...rest } = payload as Record<string, any>;
	// Recursively simplify nested objects/arrays
	for (const key of Object.keys(rest)) rest[key] = simplifyPayload(rest[key]);
	return rest;
}

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const operationResult: INodeExecutionData[] = [];
	let responseData: IDataObject | IDataObject[] = [];

	for (let i = 0; i < items.length; i++) {
		const resource = this.getNodeParameter<IKommo>('resource', i);
		// Read operation with resource-specific fallback to avoid runtime crashes when UI fails to provide it
		let operation: string;
		if (resource === 'account') operation = this.getNodeParameter('operation', i, 'getInfo') as string;
		else if (resource === 'contacts') operation = this.getNodeParameter('operation', i, 'getContacts') as string;
		else if (resource === 'leads') operation = this.getNodeParameter('operation', i, 'getLeads') as string;
		else if (resource === 'tasks') operation = this.getNodeParameter('operation', i, 'getTasks') as string;
		else if (resource === 'companies') operation = this.getNodeParameter('operation', i, 'getCompany') as string;
		else if (resource === 'notes') operation = this.getNodeParameter('operation', i, 'getNotes') as string;
		else if (resource === 'lists') operation = this.getNodeParameter('operation', i, 'getLists') as string;
		else if (resource === 'customers') operation = this.getNodeParameter('operation', i, 'getCustomers') as string;
		else if (resource === 'invoices') operation = this.getNodeParameter('operation', i, 'getInvoices') as string;
		else if (resource === 'transactions') operation = this.getNodeParameter('operation', i, 'get') as string;
		else if (resource === 'webhooks') operation = this.getNodeParameter('operation', i, 'create') as string;
		else if (resource === 'unsorted') operation = this.getNodeParameter('operation', i, 'get') as string;
		else operation = this.getNodeParameter('operation', i) as string;

		const kommo = {
			resource,
			operation,
		} as IKommo;

		try {
            if (kommo.resource === 'account') {
				responseData = await account[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'contacts') {
				responseData = await contacts[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'leads') {
				responseData = await leads[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'tasks') {
				responseData = await tasks[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'companies') {
				responseData = await companies[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'notes') {
				responseData = await notes[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'lists') {
				responseData = await lists[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'customers') {
				responseData = await customers[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'invoices') {
				responseData = await invoices[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'transactions') {
				responseData = await transactions[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'webhooks') {
				responseData = await webhooks[kommo.operation].execute.call(this, i);
			} else if (kommo.resource === 'unsorted') {
				if (kommo.operation === 'get') {
					responseData = await unsorted.get.execute.call(this, i);
				} else if (kommo.operation === 'summary') {
					responseData = await unsorted.summary.execute.call(this, i);
				} else if (kommo.operation === 'create') {
					responseData = await unsorted.create.execute.call(this, i);
				} else if (kommo.operation === 'accept') {
					responseData = await unsorted.accept.execute.call(this, i);
				} else if (kommo.operation === 'link') {
					responseData = await unsorted.link.execute.call(this, i);
				} else if (kommo.operation === 'reject') {
					responseData = await unsorted.reject.execute.call(this, i);
				}
			}

			let simplify = false; try { simplify = this.getNodeParameter("simplify", 0, false) as boolean; } catch {}
			const normalized = simplify ? simplifyPayload(responseData) : responseData;

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(normalized as IDataObject[]),
				{ itemData: { item: i } },
			);
			operationResult.push(...executionData);
		} catch (err) {
			if (this.continueOnFail()) {
				const error = err as NodeApiError | NodeOperationError;
				operationResult.push({ json: this.getInputData(i)[0].json, error });
			} else {
				if (err instanceof Error) {
					const error = err as NodeApiError | NodeOperationError;
					if (error.context) {
						(error.context as IDataObject).itemIndex = i;
					}
					throw error;
				}
				throw err;
			}
		}
	}

	return [operationResult];
}
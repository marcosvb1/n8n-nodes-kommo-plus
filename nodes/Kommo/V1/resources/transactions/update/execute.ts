import { INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { clearNullableProps } from '../../../helpers/clearNullableProps';
import { apiRequest } from '../../../transport';
import { IUpdateTransactionForm, RequestTransactionUpdate } from '../types';
import { makeCustomFieldReqObject } from '../../_components/CustomFieldsDescription';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listId = this.getNodeParameter('catalog_id', 0) as boolean;

	const requestMethod = 'PATCH';
	const endpoint = `catalogs/${listId}/elements`;

	const jsonParams = (await this.getNodeParameter('json', 0)) as boolean;

	if (jsonParams) {
		const jsonString = (await this.getNodeParameter('jsonString', 0)) as string;
		const responseData = await apiRequest.call(
			this,
			requestMethod,
			endpoint,
			JSON.parse(jsonString),
		);
		return this.helpers.returnJsonArray(responseData);
	}

	const transactionsCollection = (await this.getNodeParameter('collection', 0)) as IUpdateTransactionForm;

	const catalogCustomFields = await apiRequest.call(this, 'GET', `catalogs/${listId}/custom_fields`, {});
	const itemsFieldId = catalogCustomFields._embedded.custom_fields.find((field: any) => field.code === 'ITEMS')?.id;
	const totalFieldId = catalogCustomFields._embedded.custom_fields.find((field: any) => field.code === 'BILL_PRICE')?.id;

	const body = transactionsCollection.transaction
		.map((transaction): RequestTransactionUpdate => {
			const { existing_contact, contact_id, buyer_name, ...rest } = transaction as any;

			const custom_fields = transaction.custom_fields_values ? makeCustomFieldReqObject(transaction.custom_fields_values) : [];

			if (existing_contact) {
				custom_fields.push({
					id: 1893878,
					values: [{ value: { entity_id: contact_id, entity_type: 'contacts' } as any }],
				});
			} else {
				custom_fields.push({
					id: 1893878,
					values: [{ value: { name: buyer_name } as any }],
				});
			}

			const itemsField = custom_fields.find(field => field.id === itemsFieldId);
			if (itemsField) {
				const total = itemsField.values.reduce((acc: number, item: any) => {
					const price = parseFloat(item.unit_price) || 0;
					const quantity = parseInt(item.quantity, 10) || 0;
					const discount = parseFloat(item.discount?.value) || 0;
					return acc + (price * quantity - discount);
				}, 0);

				const totalField = custom_fields.find(field => field.id === totalFieldId);
				if (totalField) {
					totalField.values = [{ value: total.toString() }];
				} else {
					custom_fields.push({
						id: totalFieldId,
						values: [{ value: total.toString() }],
					});
				}
			}

			return {
				...rest,
				custom_fields,
			};
		})
		.map(clearNullableProps);

	const responseData = await apiRequest.call(this, requestMethod, endpoint, { update: body });
	return this.helpers.returnJsonArray(responseData);
}

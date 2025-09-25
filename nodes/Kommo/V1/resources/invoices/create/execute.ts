import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';
import { makeMultipleInvoiceItemsReqObject, IInvoiceItemsForm } from '../model';
import { makePurchaseCustomFieldReqObject, findInvoicesCatalog, createPayerFieldValue } from '../../../helpers/purchasesUtils';
import { getTimestampFromDateString } from '../../../helpers/getTimestampFromDateString';

interface IPurchaseForm {
	name: string;
	status?: string;
	payment_date?: string;
	created_at?: string;
	invoice_items?: IInvoiceItemsForm;
	custom_fields_values?: any;
	request_id?: string;
	currency_id?: number; // Adicionar currency_id opcional
    buyer?: {
        buyer_details?: {
            existing_contact: boolean;
            entity_id?: number;
            contact_name?: string;
        };
    };
}

export async function execute(this: IExecuteFunctions, index: number): Promise<any> {
    const jsonParams = (await this.getNodeParameter('json', 0)) as boolean;

    // Identificar automaticamente o catálogo de invoices e seus campos
    const catalogInfo = await findInvoicesCatalog(apiRequest, this);
    if (!catalogInfo) {
        throw new NodeOperationError(this.getNode(), 'Catálogo de invoices não encontrado', {
            description: 'Não foi possível encontrar um catálogo de tipo "invoices" na sua conta Kommo. Certifique-se de que existe um catálogo com tipo "invoices".'
        });
    }

	const { catalog, statusField, itemsField, payerField, paymentDateField, priceField } = catalogInfo;
    const endpoint = `catalogs/${catalog.id}/elements`;

    if (jsonParams) {
        const jsonString = (await this.getNodeParameter('jsonString', 0)) as string;
        return await apiRequest.call(this, 'POST', endpoint, JSON.parse(jsonString));
    }

    const elements = (this.getNodeParameter('collection.element', index, []) as IPurchaseForm[]) || [];

    const bodyPromises = elements.map(async (element) => {
        console.log(`[Purchases CREATE] Processando elemento:`, JSON.stringify(element, null, 2));

        const customFields: any[] = [];

        // 1. Campo PAYER (obrigatório)
        if (payerField && element.buyer?.buyer_details) {
            console.log(`[Purchases CREATE] Processando buyer:`, JSON.stringify(element.buyer, null, 2));
            const payerValue = createPayerFieldValue(element.buyer.buyer_details);
            console.log(`[Purchases CREATE] Payer value gerado:`, JSON.stringify(payerValue, null, 2));
            if (payerValue) {
                customFields.push({
                    field_id: payerField.id,
                    values: [payerValue]
                });
                console.log(`[Purchases CREATE] Campo PAYER adicionado:`, JSON.stringify({
                    field_id: payerField.id,
                    values: [payerValue]
                }, null, 2));
            }
        }

        // 2. Campo STATUS (obrigatório)
        if (statusField) {
            let selectedStatus = element.status;
            let statusEnum = null as any;

            // Se nenhum status foi especificado, usar o primeiro disponível no campo
            if (!selectedStatus && Array.isArray(statusField.enums) && statusField.enums.length > 0) {
                statusEnum = statusField.enums[0];
                selectedStatus = statusEnum.value || statusEnum.name || 'Created';
                console.log(`[Purchases CREATE] Nenhum status especificado. Usando primeiro disponível: ${selectedStatus}`);
            } else if (!selectedStatus) {
                // Fallback se não houver enums disponíveis
                selectedStatus = 'Created';
                console.log(`[Purchases CREATE] Nenhum status especificado e nenhuma opção encontrada. Usando fallback: ${selectedStatus}`);
            } else if (Array.isArray(statusField.enums) && statusField.enums.length > 0) {
                // Procurar o enum correspondente ao status especificado
                statusEnum = statusField.enums.find((e: any) => e.value === selectedStatus || e.name === selectedStatus) || null;
            }

            // Preferir sempre enum_id quando possível
            if (statusEnum?.id) {
                customFields.push({ field_id: statusField.id, values: [{ enum_id: statusEnum.id }] });
                console.log(`[Purchases CREATE] Status usando enum_id: ${selectedStatus} -> ID ${statusEnum.id}`);
            } else if (Array.isArray(statusField.enums) && statusField.enums[0]?.id) {
                const fallbackEnumId = statusField.enums[0].id;
                customFields.push({ field_id: statusField.id, values: [{ enum_id: fallbackEnumId }] });
                console.log(`[Purchases CREATE] Status sem correspondência. Usando primeiro enum_id disponível: ${fallbackEnumId}`);
            } else {
                customFields.push({ field_id: statusField.id, values: [{ value: selectedStatus }] });
                console.log(`[Purchases CREATE] Status usando value (último fallback): ${selectedStatus}`);
            }
        }

        // 3. Campo ITEMS se fornecidos
        if (element.invoice_items?.invoice_item?.length && itemsField) {
            console.log(`[Purchases CREATE] Processando invoice_items:`, JSON.stringify(element.invoice_items, null, 2));
			const invoiceItemsValues = makeMultipleInvoiceItemsReqObject(element.invoice_items);
			// Auto-preencher description com o nome do produto quando ausente
			try {
				const productIds = invoiceItemsValues
					.map((v: any) => v?.value?.product_id)
					.filter((id: any) => typeof id === 'number');

				if (productIds.length > 0) {
					const catalogsResponse = await apiRequest.call(this, 'GET', 'catalogs', {});
					const catalogs = catalogsResponse?._embedded?.catalogs || [];
					const productCatalog = catalogs.find((c: any) => c.type === 'products');

					if (productCatalog) {
						const elementsPages = await apiRequestAllItems.call(this, 'GET', `catalogs/${productCatalog.id}/elements`, {}, { limit: 250 });
						const elements = elementsPages.flatMap((p: any) => p?._embedded?.elements || []);
						const idToName = new Map(elements.map((el: any) => [el.id, el.name]));

						invoiceItemsValues.forEach((v: any) => {
							if (v?.value && !v.value.description && v.value.product_id) {
								const name = idToName.get(v.value.product_id);
								if (name) v.value.description = name;
							}
						});
					}
				}
			} catch (autoDescErr) {
				console.log('[Purchases CREATE] ⚠️ Falha ao preencher description automática dos itens:', autoDescErr);
			}
            console.log(`[Purchases CREATE] Invoice items values gerados:`, JSON.stringify(invoiceItemsValues, null, 2));
            if (invoiceItemsValues.length > 0) {
                customFields.push({
                    field_id: itemsField.id,
                    values: invoiceItemsValues
                });
                console.log(`[Purchases CREATE] Campo ITEMS adicionado:`, JSON.stringify({
                    field_id: itemsField.id,
                    values: invoiceItemsValues
                }, null, 2));

				// 3.1. Calcular e adicionar o campo PRICE (se existir)
				if (priceField) {
					const totalPrice = element.invoice_items.invoice_item.reduce((total, item) => {
						const price = Number(String(item.unit_price).replace(',', '.')) || 0;
						const quantity = Number(String(item.quantity).replace(',', '.')) || 0;
						const discount = Number(String(item.discount).replace(',', '.')) || 0;
						return total + (price * quantity - discount);
					}, 0);

					if (totalPrice > 0) {
						customFields.push({
							field_id: priceField.id,
							values: [{ value: totalPrice }]
						});
						console.log(`[Purchases CREATE] Campo PRICE adicionado: ${totalPrice}`);
					}
				}
            }
        }

		        // 4. Campo PAYMENT_DATE se fornecido (enviar timestamp em segundos)
				if (element.payment_date && paymentDateField) {
					const paymentTimestamp = getTimestampFromDateString(element.payment_date);
					if (paymentTimestamp) {
						customFields.push({
							field_id: paymentDateField.id,
							values: [{ value: paymentTimestamp }]
						});
						this.logger.debug(`[Purchases CREATE] Campo PAYMENT_DATE adicionado: ${element.payment_date} -> ${paymentTimestamp}`);
					}
				}
		
				// 5. Campo CREATED_AT será adicionado como date_create no payload principal, não como custom field
		// 6. Custom fields adicionais (se houver)
		if (element.custom_fields_values && element.custom_fields_values.custom_field && element.custom_fields_values.custom_field.length > 0) {
			console.log(`[Purchases CREATE] Processando ${element.custom_fields_values.custom_field.length} custom fields adicionais:`, JSON.stringify(element.custom_fields_values, null, 2));
			const additionalFields = makePurchaseCustomFieldReqObject(element.custom_fields_values.custom_field);
			console.log(`[Purchases CREATE] Custom fields processados:`, JSON.stringify(additionalFields, null, 2));
			customFields.push(...additionalFields);
		} else {
			console.log(`[Purchases CREATE] ⚠️ Nenhum custom field adicional fornecido:`, element.custom_fields_values);
		}

        const purchaseData: any = {
            name: element.name || 'Nova Fatura',
        };

        // Incluir custom_fields_values apenas quando houver campos
        if (customFields.length > 0) {
            purchaseData.custom_fields_values = customFields;
        }

        // currency_id não será enviado no create para espelhar payload válido do HTTP Request

		// Campo created_at (timestamp em segundos) como campo direto da API (não custom field)
		if (element.created_at) {
			const createdTimestamp = getTimestampFromDateString(element.created_at);
			if (createdTimestamp) {
				purchaseData.created_at = createdTimestamp;
				console.log(`[Purchases CREATE] Campo created_at adicionado: ${element.created_at} -> ${createdTimestamp}`);
			}
		}

        if (element.request_id) {
            purchaseData.request_id = element.request_id;
        }

        console.log(`[Purchases CREATE] Payload final do elemento:`, JSON.stringify(purchaseData, null, 2));
        return purchaseData;
    });

	const body = await Promise.all(bodyPromises);

    // Array direto sem wrapper, como funciona com contacts
    this.logger.debug(`[Purchases CREATE] Final request body being sent to Kommo:`, { body });
    return await apiRequest.call(this, 'POST', endpoint, body);
}

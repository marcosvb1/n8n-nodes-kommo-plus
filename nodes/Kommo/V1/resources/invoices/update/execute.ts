import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../../../transport';
import { makeMultipleInvoiceItemsReqObject, IInvoiceItemsForm } from '../model';
import { makePurchaseCustomFieldReqObject, findInvoicesCatalog, createPayerFieldValue } from '../../../helpers/purchasesUtils';
import { getTimestampFromDateString } from '../../../helpers/getTimestampFromDateString';

interface IPurchaseUpdateForm {
	id: number;
	name?: string;
	status?: string;
	payment_date?: string;
	created_at?: string;
	invoice_items?: IInvoiceItemsForm;
	custom_fields_values?: any;
	request_id?: string;
    buyer?: {
        existing_contact: boolean;
        entity_id?: number;
        contact_name?: string;
    };
}

export async function execute(this: IExecuteFunctions, index: number): Promise<any> {
    const jsonParams = (await this.getNodeParameter('json', 0)) as boolean;

    if (jsonParams) {
        const jsonString = (await this.getNodeParameter('jsonString', 0)) as string;

        // Para JSON, ainda precisamos identificar o catálogo correto
        const catalogInfo = await findInvoicesCatalog(apiRequest, this);
        if (!catalogInfo) {
            throw new NodeOperationError(this.getNode(), 'Catálogo de invoices não encontrado', {
                description: 'Não foi possível encontrar um catálogo de tipo "invoices" na sua conta Kommo.'
            });
        }

        const endpoint = `catalogs/${catalogInfo.catalog.id}/elements`;
        return await apiRequest.call(this, 'PATCH', endpoint, JSON.parse(jsonString));
    }

    // Identificar automaticamente o catálogo de invoices e seus campos
    const catalogInfo = await findInvoicesCatalog(apiRequest, this);
    if (!catalogInfo) {
        throw new NodeOperationError(this.getNode(), 'Catálogo de invoices não encontrado', {
            description: 'Não foi possível encontrar um catálogo de tipo "invoices" na sua conta Kommo. Certifique-se de que existe um catálogo com tipo "invoices".'
        });
    }

    const { catalog, statusField, itemsField, payerField, paymentDateField, priceField } = catalogInfo;
    const endpoint = `catalogs/${catalog.id}/elements`;

    console.log(`[Purchases UPDATE] Usando catálogo: ${catalog.name} (ID: ${catalog.id})`);
    if (statusField) {
        console.log(`[Purchases UPDATE] Campo Status: ${statusField.name} (ID: ${statusField.id})`);
    }
    if (itemsField) {
        console.log(`[Purchases UPDATE] Campo Items: ${itemsField.name} (ID: ${itemsField.id})`);
    }
    if (payerField) {
        console.log(`[Purchases UPDATE] Campo Payer: ${payerField.name} (ID: ${payerField.id})`);
    }

    const elements = (this.getNodeParameter('collection.element', index, []) as IPurchaseUpdateForm[]) || [];

    const body: any = [];

    for (const element of elements) {
        const purchaseData: any = {
            id: element.id
        };

        if (element.name !== undefined && element.name !== '') {
            purchaseData.name = element.name;
        }

        console.log(`[Purchases UPDATE] Processando elemento ID: ${element.id}`);

        // Array temporário para custom fields (só incluir no payload se houver campos)
        const customFields: any[] = [];

        // 1. Campo STATUS se fornecido
        if (element.status && statusField) {
            // Procurar o enum_id correspondente ao valor do status
            let statusEnum = null;
            if (statusField.enums && statusField.enums.length > 0) {
                statusEnum = statusField.enums.find((e: any) =>
                    e.value === element.status || e.name === element.status
                );
            }

            if (statusEnum && statusEnum.id) {
                // Usar enum_id (mais robusto)
                customFields.push({
                    field_id: statusField.id,
                    values: [{ enum_id: statusEnum.id }]
                });
                console.log(`[Purchases UPDATE] Status atualizado usando enum_id: ${element.status} -> ID ${statusEnum.id}`);
            } else {
                // Fallback: usar value (caso não encontre o enum_id)
                customFields.push({
                    field_id: statusField.id,
                    values: [{ value: element.status }]
                });
                console.log(`[Purchases UPDATE] Status atualizado usando value (fallback): ${element.status}`);
            }
        }

        // 2. Campo PAYER se fornecido
        if (payerField && element.buyer) {
            const payerValue = createPayerFieldValue(element.buyer);
            if (payerValue) {
                customFields.push({
                    field_id: payerField.id,
                    values: [payerValue]
                });
                console.log(`[Purchases UPDATE] Campo Payer atualizado: ${JSON.stringify(payerValue)}`);
            }
        }

        // 3. Campo ITEMS se fornecidos
        if (element.invoice_items?.invoice_item?.length && itemsField) {
            const invoiceItemsValues = makeMultipleInvoiceItemsReqObject(element.invoice_items);

            if (invoiceItemsValues.length > 0) {
                customFields.push({
                    field_id: itemsField.id,
                    values: invoiceItemsValues
                });
                console.log(`[Purchases UPDATE] ${invoiceItemsValues.length} itens atualizados`);

                // 3.1. Calcular e adicionar o campo PREÇO (se existir)
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
                            values: [{ value: String(totalPrice) }]
                        });
                        console.log(`[Purchases UPDATE] Campo PRICE atualizado: ${totalPrice}`);
                    }
                }
            }
        }

        // 4. Campo PAYMENT_DATE se fornecido (usar ISO 8601 sem milissegundos, offset +00:00)
        if (element.payment_date && paymentDateField) {
            const paymentTimestamp = getTimestampFromDateString(element.payment_date);
            if (paymentTimestamp) {
                const isoNoMs = new Date(paymentTimestamp * 1000).toISOString().replace(/\.\d{3}Z$/, '+00:00');
                customFields.push({
                    field_id: paymentDateField.id,
                    values: [{ value: isoNoMs }]
                });
                console.log(`[Purchases UPDATE] Campo PAYMENT_DATE atualizado: ${element.payment_date} -> ${isoNoMs}`);
            }
        }

        // 5. Custom fields adicionais (se houver)
        if (element.custom_fields_values && element.custom_fields_values.custom_field && element.custom_fields_values.custom_field.length > 0) {
            console.log(`[Purchases UPDATE] Processando ${element.custom_fields_values.custom_field.length} custom fields adicionais:`, JSON.stringify(element.custom_fields_values, null, 2));
            const additionalFields = makePurchaseCustomFieldReqObject(element.custom_fields_values.custom_field);
            console.log(`[Purchases UPDATE] Custom fields processados:`, JSON.stringify(additionalFields, null, 2));
            customFields.push(...additionalFields);
        }

        // Só incluir custom_fields_values se houver campos para atualizar
        if (customFields.length > 0) {
            purchaseData.custom_fields_values = customFields;
            console.log(`[Purchases UPDATE] Incluindo ${customFields.length} custom fields no payload`);
        } else {
            console.log(`[Purchases UPDATE] Nenhum custom field para atualizar`);
        }

        // 6. Campo date_create (timestamp em segundos) como campo direto da API (não custom field)
        if (element.created_at) {
            const createdTimestamp = getTimestampFromDateString(element.created_at);
            if (createdTimestamp) {
                purchaseData.date_create = createdTimestamp;
                console.log(`[Purchases UPDATE] Campo date_create atualizado: ${element.created_at} -> ${createdTimestamp}`);
            }
        }

        // 7. Request ID para tracking
        if (element.request_id) {
            purchaseData.request_id = element.request_id;
        }

        console.log(`[Purchases UPDATE] Payload do elemento: ${JSON.stringify(purchaseData, null, 2)}`);
        body.push(purchaseData);
    }

    console.log(`[Purchases UPDATE] Fazendo requisição PATCH para: ${endpoint}`);
    console.log(`[Purchases UPDATE] Payload completo: ${JSON.stringify(body, null, 2)}`);

    try {
        // Array direto sem wrapper, como funciona com contacts
        console.log(`[Purchases UPDATE] Payload final da requisição (array direto):`, JSON.stringify(body, null, 2));
        const response = await apiRequest.call(this, 'PATCH', endpoint, body);
        console.log(`[Purchases UPDATE] Resposta da API: ${JSON.stringify(response, null, 2)}`);
        return response;
    } catch (error) {
        console.error(`[Purchases UPDATE] Erro na atualização:`, error);
        throw error;
    }
}

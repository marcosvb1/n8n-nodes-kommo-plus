import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';
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

    if (statusField) {
    }
    if (itemsField) {
    }
    if (payerField) {
    }

    const elements = (this.getNodeParameter('collection.element', index, []) as IPurchaseUpdateForm[]) || [];

    const body: any = [];

    for (const element of elements) {

        // 0) Buscar estado atual do elemento para enviar payload completo e evitar 400
        let existingElement: any | null = null;
        try {
            // Tentar endpoint direto por ID
            const existingDirect = await apiRequest.call(this, 'GET', `catalogs/${catalog.id}/elements/${element.id}`, {});
            existingElement = existingDirect || null;
        } catch (e1) {
            try {
                // Fallback: listar filtrando por id
                const existingResp = await apiRequest.call(this, 'GET', `catalogs/${catalog.id}/elements`, {}, { id: [element.id] as any });
                existingElement = existingResp?._embedded?.elements?.[0] || null;
            } catch (e2) {
            }
        }

        const purchaseData: any = {
            id: element.id,
        };

        // Nome: usar o informado, senão manter o atual
        if (element.name !== undefined && element.name !== '') {
            purchaseData.name = element.name;
        } else if (existingElement?.name) {
            purchaseData.name = existingElement.name;
        }

        // Iniciar customFields com os atuais (baseline), para só sobrescrever os alterados
        const customFields: any[] = Array.isArray(existingElement?.custom_fields_values)
            ? existingElement.custom_fields_values.map((cf: any) => ({ field_id: cf.field_id, values: cf.values }))
            : [];

        // Função utilitária para sanitizar valores do campo ITEMS
        const sanitizeItemValue = (val: any) => {
            const src = val?.value || val;
            const cleaned: any = {};
            if (typeof src.product_id === 'number') cleaned.product_id = src.product_id;
            if (src.quantity !== undefined) cleaned.quantity = Number(String(src.quantity).replace(',', '.'));
            if (src.unit_price !== undefined) cleaned.unit_price = Number(String(src.unit_price).replace(',', '.'));
            if (src.description) cleaned.description = String(src.description);
            if (src.discount) {
                const dv = Number(String(src.discount.value ?? src.discount).replace(',', '.')) || 0;
                cleaned.discount = dv > 0 ? { type: 'amount', value: dv } : { type: 'percentage', value: 0 };
            } else {
                cleaned.discount = { type: 'percentage', value: 0 };
            }
            return { value: cleaned };
        };

        const upsertField = (fieldId: number, values: any[]) => {
            const idx = customFields.findIndex((cf: any) => cf.field_id === fieldId);
            if (idx >= 0) customFields.splice(idx, 1);
            customFields.push({ field_id: fieldId, values });
        };

        // Sanitizar baseline: limpar ITEMS e PRICE para formato aceito pela API
        if (Array.isArray(customFields) && customFields.length) {
            for (let i = 0; i < customFields.length; i++) {
                const cf = customFields[i];
                if (itemsField && cf.field_id === itemsField.id && Array.isArray(cf.values)) {
                    cf.values = cf.values.map((v: any) => sanitizeItemValue(v));
                }
                if (priceField && cf.field_id === priceField.id && Array.isArray(cf.values) && cf.values[0]?.value !== undefined) {
                    cf.values[0].value = Number(String(cf.values[0].value).replace(',', '.'));
                }
                if (paymentDateField && cf.field_id === paymentDateField.id && Array.isArray(cf.values) && typeof cf.values[0]?.value === 'string') {
                    // se baseline veio ISO string, tentar converter para timestamp se possível
                    const ts = Date.parse(cf.values[0].value);
                    if (!Number.isNaN(ts)) cf.values[0].value = Math.floor(ts / 1000);
                }
            }
        }

        // 1. Campo STATUS se fornecido (aceita enum_id, enum_code, value/name)
        if (element.status !== undefined && statusField) {
            const enums = Array.isArray(statusField.enums) ? statusField.enums : [];
            let chosen: any = null;

            // a) Se veio numérico, tratar como enum_id
            if (typeof element.status === 'number') {
                chosen = enums.find((e: any) => e.id === element.status) || null;
            }

            // b) Se veio string, tentar casar por value, name ou enum_code (case-insensitive)
            if (!chosen && typeof element.status === 'string') {
                const s = element.status.trim().toLowerCase();
                chosen =
                    enums.find((e: any) => String(e.value).toLowerCase() === s) ||
                    enums.find((e: any) => String(e.name).toLowerCase() === s) ||
                    enums.find((e: any) => String(e.enum_code || '').toLowerCase() === s) || null;

                // c) Mapear alias comuns (ex.: "paid" <-> "paga")
                if (!chosen) {
                    const alias: Record<string, string> = {
                        paga: 'paid',
                        pago: 'paid',
                        paid: 'paid',
                        created: 'created',
                        feita: 'created',
                        cancelada: 'cancelled',
                        cancelled: 'cancelled',
                    };
                    const mapped = alias[s];
                    if (mapped) {
                        chosen = enums.find((e: any) => String(e.enum_code || '').toLowerCase() === mapped);
                    }
                }
            }

            if (chosen?.id) {
                upsertField(statusField.id, [{ enum_id: chosen.id }]);
            } else if (enums[0]?.id) {
                upsertField(statusField.id, [{ enum_id: enums[0].id }]);
            } else {
                upsertField(statusField.id, [{ value: String(element.status) }]);
            }
        }

        // 2. Campo PAYER se fornecido
        if (payerField && element.buyer) {
            const payerValue = createPayerFieldValue(element.buyer);
            if (payerValue) {
                upsertField(payerField.id, [payerValue]);
            }
        }

        // 3. Campo ITEMS se fornecidos
        if (element.invoice_items?.invoice_item?.length && itemsField) {
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
            }

            if (invoiceItemsValues.length > 0) {
                upsertField(itemsField.id, invoiceItemsValues);

                // 3.1. Calcular e adicionar o campo PREÇO (se existir) como número
                if (priceField) {
                    const totalPrice = element.invoice_items.invoice_item.reduce((total, item) => {
                        const price = Number(String(item.unit_price).replace(',', '.')) || 0;
                        const quantity = Number(String(item.quantity).replace(',', '.')) || 0;
                        const discount = Number(String(item.discount).replace(',', '.')) || 0;
                        return total + (price * quantity - discount);
                    }, 0);

                    if (totalPrice > 0) {
                        upsertField(priceField.id, [{ value: totalPrice }]);
                    }
                }
            }
        }

        // 4. Campo PAYMENT_DATE se fornecido (enviar timestamp em segundos)
        if (element.payment_date && paymentDateField) {
            const paymentTimestamp = getTimestampFromDateString(element.payment_date);
            if (paymentTimestamp) {
                upsertField(paymentDateField.id, [{ value: paymentTimestamp }]);
            }
        }

        // 5. Custom fields adicionais (se houver) — sobrescrever (upsert) os existentes no baseline
        if (element.custom_fields_values && element.custom_fields_values.custom_field && element.custom_fields_values.custom_field.length > 0) {
            const additionalFields = makePurchaseCustomFieldReqObject(element.custom_fields_values.custom_field);
            for (const af of additionalFields) {
                upsertField(af.field_id, af.values);
            }
        }

        // Incluir todos os custom_fields (baseline + alterações)
        if (customFields.length > 0) {
            purchaseData.custom_fields_values = customFields;
        }

        // 6. Campo created_at (timestamp em segundos) como campo direto da API (não custom field)
        if (element.created_at) {
            const createdTimestamp = getTimestampFromDateString(element.created_at);
            if (createdTimestamp) {
                purchaseData.created_at = createdTimestamp;
            }
        }

        // 7. Request ID para tracking
        if (element.request_id) {
            purchaseData.request_id = element.request_id;
        }

        body.push(purchaseData);
    }


    try {
        // Array direto sem wrapper, como funciona com contacts
        const responseData = await apiRequest.call(this, 'PATCH', endpoint, body);
        return this.helpers.returnJsonArray(responseData);
    } catch (error) {
        console.error(`[Purchases UPDATE] Erro na atualização:`, error);
        throw error;
    }
}

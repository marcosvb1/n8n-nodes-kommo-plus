/**
 * Utilitários específicos para purchases/invoices
 * Baseado nos testes reais da API
 */

export interface PurchaseCustomField {
    field_id: number;
    field_type: string;
    field_code: string;
    value: any;
}

/**
 * Converte custom fields para o formato correto da API de purchases
 * Baseado nos testes: campos enum devem usar value como string
 */
export function makePurchaseCustomFieldReqObject(customFieldsValues: any[]): Array<{
    field_id: number;
    values: Array<{ value?: string | number | boolean; enum_id?: number }>;
}> {
    if (!Array.isArray(customFieldsValues) || customFieldsValues.length === 0) {
        return [];
    }

    return customFieldsValues.map(cf => {
        const fieldData = JSON.parse(cf.data);
        const fieldType = fieldData.type;
        const fieldId = fieldData.id;

        let processedValue: any;

        switch (fieldType) {
            case 'select':
            case 'radiobutton':
                // Para purchases/invoices, usar enum_id quando possível (mais robusto)
                if (typeof cf.value === 'number') {
                    // Se for número, usar como enum_id
                    processedValue = { enum_id: cf.value };
                } else if (typeof cf.value === 'string') {
                    // Se for string, tentar encontrar o enum_id correspondente
                    // Por enquanto usar value, mas pode ser melhorado para buscar enum_id
                    processedValue = { value: cf.value };
                } else {
                    processedValue = { value: String(cf.value) };
                }
                break;

            case 'multiselect':
                // Para multiselect, pode ter múltiplos valores
                if (typeof cf.value === 'string' && cf.value.includes(',')) {
                    const values = cf.value.split(',').map((v: string) => ({ value: v.trim() }));
                    return { field_id: fieldId, values };
                } else {
                    processedValue = { value: String(cf.value) };
                }
                break;

            case 'checkbox':
                processedValue = { value: Boolean(cf.value) };
                break;

            case 'date':
            case 'date_time':
            case 'birthday':
                processedValue = { value: Number(cf.value) };
                break;

            case 'numeric':
            case 'price':
            case 'monetary':
                processedValue = { value: Number(cf.value) };
                break;

            default:
                // Para outros tipos, usar como string
                processedValue = { value: String(cf.value) };
                break;
        }

        return {
            field_id: fieldId,
            values: [processedValue]
        };
    });
}

/**
 * Adiciona automaticamente o campo Status obrigatório se não estiver presente
 */
export function ensureRequiredStatusField(
    customFieldsValues: any[],
    statusFieldId: number,
    defaultStatus: string = 'Created'
): any[] {
    // Verificar se já tem o campo status
    const hasStatus = customFieldsValues.some(cf => {
        const fieldData = JSON.parse(cf.data);
        return fieldData.id === statusFieldId;
    });

    if (!hasStatus) {
        // Adicionar campo status com valor padrão
        customFieldsValues.push({
            data: JSON.stringify({ id: statusFieldId, type: 'select' }),
            value: defaultStatus
        });
    }

    return customFieldsValues;
}

/**
 * Cria o valor correto para o campo PAYER
 */
export function createPayerFieldValue(buyer: any): { value: any } | null {
    if (!buyer) return null;

    if (buyer.existing_contact && buyer.entity_id) {
        // Contato existente - usar entity_id
        return {
            value: {
                entity_id: buyer.entity_id,
                entity_type: 'contacts'
            }
        };
    } else if (!buyer.existing_contact && buyer.contact_name) {
        // Nome customizado do comprador - usar name
        return {
            value: {
                name: buyer.contact_name
            }
        };
    }

    return null;
}

/**
 * Identifica automaticamente o catálogo de invoices
 */
export async function findInvoicesCatalog(apiRequestFn: Function, context: any): Promise<{
    catalog: any;
    statusField: any;
    itemsField: any;
    payerField: any;
    paymentDateField: any;
    priceField: any;
    createdAtField: any;
} | null> {
    try {
        // 1. Listar catálogos
        const catalogsResponse = await apiRequestFn.call(context, 'GET', 'catalogs');
        const catalogs = catalogsResponse._embedded?.catalogs || [];

        catalogs.forEach((cat: any, index: number) => {
        });

        // 2. Encontrar catálogo de invoices
        let invoicesCatalog = catalogs.find((c: any) => c.type === 'invoices');

        // Se não encontrou tipo "invoices", tentar alternativas
        if (!invoicesCatalog) {

            // Tentar encontrar por nome que contenha "invoice", "fatura" ou "compra"
            const alternativeNames = ['invoice', 'fatura', 'compra', 'purchase'];
            invoicesCatalog = catalogs.find((c: any) =>
                alternativeNames.some(name =>
                    c.name?.toLowerCase().includes(name)
                )
            );

            if (invoicesCatalog) {
            } else {
                catalogs.forEach((cat: any) => {
                });
                return null;
            }
        }


        // 3. Obter custom fields do catálogo
        const fieldsResponse = await apiRequestFn.call(context, 'GET', `catalogs/${invoicesCatalog.id}/custom_fields`);
        const customFields = fieldsResponse._embedded?.custom_fields || [];

        customFields.forEach((field: any, index: number) => {
        });

        // 4. Identificar campos importantes
        // Tentar diferentes códigos para os campos
        let statusField = customFields.find((f: any) => f.code === 'BILL_STATUS');
        if (!statusField) {
            // Tentar outros códigos possíveis para status
            statusField = customFields.find((f: any) =>
                ['STATUS', 'INVOICE_STATUS', 'PURCHASE_STATUS'].includes(f.code) ||
                f.type === 'select' && f.name?.toLowerCase().includes('status')
            );
        }

        let itemsField = customFields.find((f: any) => f.code === 'ITEMS');
        if (!itemsField) {
            // Tentar outros códigos possíveis para items
            itemsField = customFields.find((f: any) =>
                ['INVOICE_ITEMS', 'PURCHASE_ITEMS', 'PRODUCTS'].includes(f.code) ||
                f.type === 'items'
            );
        }

		let priceField = customFields.find((f: any) => f.code === 'PRICE');
		if (!priceField) {
			// Tentar outros códigos possíveis para price/total
			priceField = customFields.find((f: any) =>
				['TOTAL', 'AMOUNT', 'BILL_AMOUNT', 'TOTAL_PRICE', 'TOTAL_AMOUNT'].includes(f.code) ||
				(f.type === 'monetary' || f.type === 'numeric') && (
					f.name?.toLowerCase().includes('price') || 
					f.name?.toLowerCase().includes('total') || 
					f.name?.toLowerCase().includes('valor') ||
					f.name?.toLowerCase().includes('preço') ||
					f.name?.toLowerCase().includes('amount')
				)
			);
		}

		let payerField = customFields.find((f: any) => f.code === 'PAYER');
		if (!payerField) {
			// Tentar outros códigos possíveis para payer
			payerField = customFields.find((f: any) =>
				['BUYER', 'CUSTOMER', 'CLIENT', 'CONTACT'].includes(f.code) ||
				f.type === 'payer' ||
				(f.name?.toLowerCase().includes('comprador') || f.name?.toLowerCase().includes('cliente'))
			);
		}

		let paymentDateField = customFields.find((f: any) => f.code === 'BILL_PAYMENT_DATE');
		if (!paymentDateField) {
			// Tentar outros códigos possíveis para payment date
			paymentDateField = customFields.find((f: any) =>
				['PAYMENT_DATE', 'PAY_DATE', 'DUE_DATE'].includes(f.code) ||
				(f.type === 'date_time' && (f.name?.toLowerCase().includes('payment') || f.name?.toLowerCase().includes('pagamento')))
			);
		}

		let createdAtField = customFields.find((f: any) => f.code === 'CREATED_AT');
		if (!createdAtField) {
			// Tentar outros códigos possíveis para created at
			createdAtField = customFields.find((f: any) =>
				['CREATE_DATE', 'CREATION_DATE', 'DATE_CREATED', 'BILL_CREATE_DATE', 'BILL_CREATED_AT', 'INVOICE_CREATE_DATE', 'INVOICE_CREATED_AT'].includes(f.code) ||
				(f.type === 'date_time' && (
					f.name?.toLowerCase().includes('creat') ||
					f.name?.toLowerCase().includes('criação') ||
					f.name?.toLowerCase().includes('criado') ||
					f.name?.toLowerCase().includes('create') ||
					f.name?.toLowerCase().includes('data de criação') ||
					f.name?.toLowerCase().includes('data criação')
				))
			);
		}



		return {
			catalog: invoicesCatalog,
			statusField,
			itemsField,
			payerField,
			paymentDateField,
			priceField,
			createdAtField
		};

    } catch (error) {
        console.error('Erro ao identificar catálogo de invoices:', error);
        return null;
    }
}

/**
 * Valida se um catálogo é adequado para purchases
 */
export function validatePurchasesCatalog(catalog: any): { isValid: boolean; message: string } {
    if (!catalog) {
        return { isValid: false, message: 'Catálogo não encontrado' };
    }

    if (!catalog.can_add_elements) {
        return { isValid: false, message: 'Catálogo não permite adicionar elementos' };
    }

    if (catalog.type !== 'invoices' && catalog.type !== 'regular') {
        return {
            isValid: false,
            message: `Tipo de catálogo '${catalog.type}' pode não ser adequado para purchases. Use 'invoices' ou 'regular'.`
        };
    }

    return { isValid: true, message: 'Catálogo válido para purchases' };
}

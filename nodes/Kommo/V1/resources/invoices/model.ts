import { INodeProperties } from 'n8n-workflow';
import { addCustomFieldDescription } from '../_components/CustomFieldsDescription';

// Invoice item interfaces
export interface IInvoiceItem {
    catalog_element_id?: number;
    quantity: number;
    unit_price: number;
    unit_type?: string;
    // discount will be mapped to { type: 'amount' | 'percent', value: number }
    discount?: number;
}

export interface IInvoiceItemForm {
	catalog_element_id: string;
	quantity: number;
	unit_price: number;
	discount: number;
	description?: string;
}

export interface IInvoiceItemsForm {
	invoice_item: Array<IInvoiceItemForm>;
}

// Invoice items UI component
export const addInvoiceItemsDescription = (): INodeProperties => {
	return {
		displayName: 'Invoice Items',
		name: 'invoice_items',
		placeholder: 'Add Invoice Item',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				displayName: 'Invoice Item',
				name: 'invoice_item',
				values: [
					{
						displayName: 'Product Name or ID',
						name: 'catalog_element_id',
						type: 'options',
						typeOptions: {
                            loadOptionsMethod: 'getPurchaseProducts',
						},
						default: '',
						required: true,
						description: 'Select the product for this invoice item. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						required: true,
						description: 'Quantity of the product',
						typeOptions: {
							minValue: 0,
							numberPrecision: 2,
						},
					},
					{
						displayName: 'Unit Price',
						name: 'unit_price',
						type: 'number',
						default: 0,
						required: true,
						description: 'Unit price of the product',
						typeOptions: {
							minValue: 0,
							numberPrecision: 2,
						},
					},
					{
						displayName: 'Discount',
						name: 'discount',
						type: 'number',
						default: 0,
						description: 'Discount amount',
						typeOptions: {
							minValue: 0,
							numberPrecision: 2,
						},
					},
				],
			},
		],
	};
};

// Invoice model description
export const invoiceModelDescription: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		type: 'number',
		default: 0,
		required: true,
	},
	{
		displayName: 'Purchase Title',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Title of the invoice',
	},
	{
		displayName: 'Status Name or ID',
		name: 'status',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getInvoiceStatusOptions',
		},
		default: '',
		required: true,
		description: 'Status of the invoice. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Payment Date',
		name: 'payment_date',
		type: 'dateTime',
		default: '',
		description: 'Date when the payment was made or is expected',
	},
	{
		displayName: 'Created At',
		name: 'created_at',
		type: 'dateTime',
		default: '',
		description: 'Creation date of the invoice (auto-filled if not provided)',
	},
	{
		displayName: 'Buyer',
		name: 'buyer',
		type: 'fixedCollection',
		default: {},
		options: [
			{
				displayName: 'Buyer Details',
				name: 'buyer_details',
				values: [
					{
						displayName: 'Existing Contact',
						name: 'existing_contact',
						type: 'boolean',
						default: true,
						description: 'Whether to link to an existing contact or create a new buyer name',
					},
					{
						displayName: 'Contact ID',
						name: 'entity_id',
						type: 'number',
						default: 0,
						required: true,
						description: 'ID of the existing contact',
						displayOptions: {
							show: { existing_contact: [true] },
						},
					},
					{
						displayName: 'Contact Name',
						name: 'contact_name',
						type: 'string',
						default: '',
						required: true,
						description: 'Name of the buyer (will not be linked to an existing contact)',
						displayOptions: {
							show: { existing_contact: [false] },
						},
					},
				],
			},
		],
	},
	addInvoiceItemsDescription(),
	addCustomFieldDescription('getPurchaseCatalogCustomFields'),
];

// Helper function to convert invoice items form to API format
// Baseado nos testes: campo items aceita objeto único, não array
export const makeInvoiceItemsReqObject = (invoiceItemsForm: IInvoiceItemsForm): Record<string, any> | null => {
    const items = invoiceItemsForm.invoice_item;
    if (!items || items.length === 0) {
        return null;
    }

    // Para campo de tipo "items", usar apenas o primeiro item como objeto
    // Se múltiplos items são necessários, devem ser enviados como múltiplos values
    const firstItem = items[0];
    const itemObject: Record<string, any> = {
        quantity: firstItem.quantity,
        unit_price: firstItem.unit_price,
    };

    if (firstItem.catalog_element_id) {
        const parsed = parseInt(firstItem.catalog_element_id, 10);
        if (!Number.isNaN(parsed)) {
            itemObject.product_id = parsed;
        }
    }

    if (firstItem.discount && Number(firstItem.discount) > 0) {
        itemObject.discount = { type: 'amount', value: Number(firstItem.discount) };
    }

    return itemObject;
};

// Helper function para converter múltiplos items em múltiplos values
export const makeMultipleInvoiceItemsReqObject = (invoiceItemsForm: IInvoiceItemsForm): Array<Record<string, any>> => {
    const items = invoiceItemsForm.invoice_item;
    if (!items || items.length === 0) {
        return [];
    }

    return items.map((item) => {
        // Campos essenciais exigidos pela API
        const quantity = Number(String(item.quantity).replace(',', '.'));
        const unitPrice = Number(String(item.unit_price).replace(',', '.'));

        if (!item.catalog_element_id) {
            throw new Error('catalog_element_id (product_id) é obrigatório para cada item da fatura');
        }

        const parsed = parseInt(item.catalog_element_id, 10);
        if (Number.isNaN(parsed)) {
            throw new Error(`catalog_element_id inválido: ${item.catalog_element_id}. Deve ser um número válido.`);
        }

        const itemObject: Record<string, any> = {
            product_id: parsed,
            quantity: quantity,
            unit_price: unitPrice,
        };

        // Description opcional quando fornecida
        if (item.description && String(item.description).trim() !== '') {
            itemObject.description = String(item.description);
        }

        // Sempre enviar discount; se zero, usar percentage 0 (alinhado ao GET)
        const discountValue = item.discount ? Number(String(item.discount).replace(',', '.')) : 0;
        itemObject.discount =
            discountValue > 0
                ? { type: 'amount', value: discountValue }
                : { type: 'percentage', value: 0 };

        // A API preencherá automaticamente description, sku, external_uid, metadata, etc.
        // Envolver cada item no wrapper { value: { ... } }
        return { value: itemObject } as Record<string, any>;
    });
};

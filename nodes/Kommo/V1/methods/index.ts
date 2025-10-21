import { ILoadOptionsFunctions, INodePropertyOptions, NodeOperationError } from 'n8n-workflow';
import {
	IAccount,
	IKommoUser,
	ICatalog,
	ICatalogElement,
	ICustomField,
	ILossReason,
	IPipeline,
	IResponseData,
	IStatus,
	ITag,
} from '../Interface';
import { apiRequest, apiRequestAllItems } from '../transport';
import { statusPropertyOptions } from '../helpers/statusPropertyOptions';
import { cacheOptionsRequest } from '../helpers/cacheRequest';

export const getPipelines = cacheOptionsRequest(async function getPipelines(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const responseData = await apiRequest.call(this, 'GET', 'leads/pipelines', {});

	if (!responseData?._embedded?.pipelines) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return (
		responseData?._embedded?.pipelines.map(
			(pipeline: IPipeline): INodePropertyOptions => ({
				name: `${pipeline.name} ${pipeline.is_main ? '(main)' : ''}`,
				value: pipeline.id,
			}),
		) || []
	);
});

async function getAllStatuses(this: ILoadOptionsFunctions): Promise<IStatus[]> {
	const pipelinesResponseData = await getPipelines.call(this);
	// const pipelinesResponseData = await apiRequest.call(this, 'GET', 'leads/pipelines', {});
	if (!pipelinesResponseData.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}
	const resultArray: IStatus[] = [];
	for (const pipeline of pipelinesResponseData) {
		const responseData = await apiRequest.call(
			this,
			'GET',
			`leads/pipelines/${pipeline.value}/statuses`,
			{},
		);
		const statuses: IStatus[] = responseData?._embedded?.statuses.map((s: IStatus) => ({
			...s,
			pipeline_name: pipeline.name,
		}));
		if (statuses) resultArray.push(...statuses);
	}
	return resultArray;
}

export const getStatuses = cacheOptionsRequest(async function getStatuses(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const statuses = await getAllStatuses.call(this);
	if (statuses) return statuses.map(statusPropertyOptions);
	return [];
});

export const getStatusesWithoutUnsorted = cacheOptionsRequest(
	async function getStatusesWithoutUnsorted(
		this: ILoadOptionsFunctions,
	): Promise<INodePropertyOptions[]> {
		const statuses = await getAllStatuses.call(this);
		return [
			{ name: 'Not Selected', value: 0 },
			...statuses.filter((s) => !s.type).map(statusPropertyOptions),
		];
	},
);

export const getCatalogs = cacheOptionsRequest(async function getCatalogs(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const catalogsResponseData = await apiRequestAllItems.call(this, 'GET', 'catalogs', {});
	return catalogsResponseData.flatMap((data) => {
		if (!data?._embedded?.catalogs) return [];
		return data._embedded.catalogs.map((catalog: ICatalog) => ({
			name: catalog.name,
			value: catalog.id,
		}));
	});
});

export const getCatalogElements = cacheOptionsRequest(async function getCatalogElements(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const catalogId = await this.getNodeParameter('catalog_id', 0);
	const elementsResponseData = await apiRequestAllItems.call(
		this,
		'GET',
		`catalogs/${catalogId}/elements`,
		{},
	);
	return elementsResponseData.flatMap((data) => {
		if (!data?._embedded?.elements) return [];
		return data._embedded.elements.map((el: ICatalogElement) => ({
			name: el.name,
			value: el.id,
		}));
	});
});

export const getActiveUsers = cacheOptionsRequest(async function getActiveUsers(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const usersResponseDatas: Array<IResponseData<'users', IKommoUser>> =
		await apiRequestAllItems.call(this, 'GET', 'users', {});

	const users = usersResponseDatas.reduce((acc: IKommoUser[], response) => {
		acc.push(...response._embedded.users);
		return acc;
	}, []);

	if (!users?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return users
		.filter((user) => user.rights.is_active)
		.map((user) => ({
			name: user.name,
			value: user.id,
		}));
});

export const getActiveUsersWithRobot = cacheOptionsRequest(async function getActiveUsersWithRobot(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const users = await getActiveUsers.call(this);
	return [{ name: 'Not Selected', value: 0 }, ...users];
});

export const getLeadCustomFields = cacheOptionsRequest(async function (
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cfResponseData: Array<IResponseData<'custom_fields', ICustomField>> =
		await apiRequestAllItems.call(this, 'GET', `leads/custom_fields`, {});

	const customFields = cfResponseData.reduce((acc: ICustomField[], response) => {
		acc.push(...response._embedded.custom_fields);
		return acc;
	}, []);

	if (!customFields?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return customFields.map((field) => ({
		name: `${field.name} (${field.type})`,
		value: JSON.stringify({ id: field.id, type: field.type }),
	}));
});

export const getContactCustomFields = cacheOptionsRequest(async function getContactCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cfResponseData: Array<IResponseData<'custom_fields', ICustomField>> =
		await apiRequestAllItems.call(this, 'GET', `contacts/custom_fields`, {});

	const customFields = cfResponseData.reduce((acc: ICustomField[], response) => {
		acc.push(...response._embedded.custom_fields);
		return acc;
	}, []);

	if (!customFields?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return customFields.map((field) => ({
		name: `${field.name} (${field.type})`,
		value: JSON.stringify({ id: field.id, type: field.type }),
	}));
});

export const getCompanyCustomFields = cacheOptionsRequest(async function getCompanyCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cfResponseData: Array<IResponseData<'custom_fields', ICustomField>> =
		await apiRequestAllItems.call(this, 'GET', `companies/custom_fields`, {});

	const customFields = cfResponseData.reduce((acc: ICustomField[], response) => {
		acc.push(...response._embedded.custom_fields);
		return acc;
	}, []);

	if (!customFields?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return customFields.map((field) => ({
		name: `${field.name} (${field.type})`,
		value: JSON.stringify({ id: field.id, type: field.type }),
	}));
});

export const getCustomerCustomFields = cacheOptionsRequest(async function getCustomerCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cfResponseData: Array<IResponseData<'custom_fields', ICustomField>> =
		await apiRequestAllItems.call(this, 'GET', `customers/custom_fields`, {});

	const customFields = cfResponseData.reduce((acc: ICustomField[], response) => {
		acc.push(...response._embedded.custom_fields);
		return acc;
	}, []);

	if (!customFields?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return customFields.map((field) => ({
		name: `${field.name} (${field.type})`,
		value: JSON.stringify({ id: field.id, type: field.type }),
	}));
});

export const getCustomerSegmentCustomFields = cacheOptionsRequest(
	async function getCustomerSegmentCustomFields(
		this: ILoadOptionsFunctions,
	): Promise<INodePropertyOptions[]> {
		const cfResponseData: Array<IResponseData<'custom_fields', ICustomField>> =
			await apiRequestAllItems.call(this, 'GET', `customers/segments/custom_fields`, {});

		const customFields = cfResponseData.reduce((acc: ICustomField[], response) => {
			acc.push(...response._embedded.custom_fields);
			return acc;
		}, []);

		if (!customFields?.length) {
			throw new NodeOperationError(this.getNode(), 'No data got returned');
		}

		return customFields.map((field) => ({
			name: `${field.name} (${field.type})`,
			value: JSON.stringify({ id: field.id, type: field.type }),
		}));
	},
);

export const getCatalogCustomFields = cacheOptionsRequest(async function getCatalogCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const catalog_id = await this.getNodeParameter('catalog_id', 0);

	if (!catalog_id) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	const cfResponseData: Array<IResponseData<'custom_fields', ICustomField>> =
		await apiRequestAllItems.call(this, 'GET', `catalogs/${catalog_id}/custom_fields`, {});

	const customFields = cfResponseData.reduce((acc: ICustomField[], response) => {
		acc.push(...response._embedded.custom_fields);
		return acc;
	}, []);

	if (!customFields?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return customFields.map((field) => ({
		name: `${field.name} (${field.type})`,
		value: JSON.stringify({ id: field.id, type: field.type }),
	}));
});

export const getTransactionCustomFields = cacheOptionsRequest(async function getTransactionCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const catalog_id = await this.getNodeParameter('catalog_id', 0);

	if (!catalog_id) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	const cfResponseData: Array<IResponseData<'custom_fields', ICustomField>> =
		await apiRequestAllItems.call(this, 'GET', `catalogs/${catalog_id}/custom_fields`, {});

	const customFields = cfResponseData.reduce((acc: ICustomField[], response) => {
		acc.push(...response._embedded.custom_fields);
		return acc;
	}, []);

	if (!customFields?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	const excludedFields = ['Status', 'Total', 'Comprador'];

	return customFields
		.filter(field => !excludedFields.includes(field.name))
		.map((field) => ({
			name: `${field.name} (${field.type})`,
			value: JSON.stringify({ id: field.id, type: field.type }),
		}));
});

export const getLossReasons = cacheOptionsRequest(async function getLossReasons(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accSettingsData: IAccount = await apiRequest.call(this, 'GET', 'account', {});
	if (!accSettingsData.is_loss_reason_enabled) return [];

	const lrResponseData: Array<IResponseData<'loss_reasons', ILossReason>> =
		await apiRequestAllItems.call(this, 'GET', 'leads/loss_reasons', {});

	const lossReasons = lrResponseData.reduce((acc: ILossReason[], response) => {
		acc.push(...response._embedded.loss_reasons);
		return acc;
	}, []);

	if (!lossReasons?.length) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	return lossReasons.map((field) => ({
		name: field.name,
		value: field.id,
	}));
});

// export async function getSources(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
// const sources = await apiRequest.call(this, 'GET', 'sources', {});
// 	return [];
// }

// Purchase-specific methods
export const getPurchaseCatalogs = cacheOptionsRequest(async function getPurchaseCatalogs(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const catalogsResponseData = await apiRequestAllItems.call(this, 'GET', 'catalogs', {});
	return catalogsResponseData.flatMap((data) => {
		if (!data?._embedded?.catalogs) return [];
		return data._embedded.catalogs
			.filter((catalog: ICatalog) => catalog.type === 'invoices')
			.map((catalog: ICatalog) => ({
				name: catalog.name,
				value: catalog.id,
			}));
	});
});

// Product-specific methods for invoice items
export const getProductCatalogs = cacheOptionsRequest(async function getProductCatalogs(
    this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
    const catalogsResponseData = await apiRequestAllItems.call(this, 'GET', 'catalogs', {});
    return catalogsResponseData.flatMap((data) => {
        if (!data?._embedded?.catalogs) return [];
        return data._embedded.catalogs
            .filter((catalog: ICatalog) => catalog.type === 'products')
            .map((catalog: ICatalog) => ({
                name: catalog.name,
                value: catalog.id,
            }));
    });
});

export const getInvoicesCatalogs = cacheOptionsRequest(async function getInvoicesCatalogs(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const catalogsResponseData = await apiRequestAllItems.call(this, 'GET', 'catalogs', {});
	return catalogsResponseData.flatMap((data) => {
		if (!data?._embedded?.catalogs) return [];
		return data._embedded.catalogs
			.filter((catalog: ICatalog) => catalog.type === 'invoices')
			.map((catalog: ICatalog) => ({
				name: catalog.name,
				value: catalog.id,
			}));
	});
});

export const getPurchaseProducts = cacheOptionsRequest(async function getPurchaseProducts(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
    try {

        // 1. Buscar catálogos disponíveis
        const catalogsResponse = await apiRequest.call(this, 'GET', 'catalogs', {});

        if (!catalogsResponse?._embedded?.catalogs) {
            return [];
        }

        const catalogs = catalogsResponse._embedded.catalogs;
        catalogs.forEach((catalog: ICatalog) => {
        });

        // 2. Encontrar catálogo de produtos (type = "products")
        const productCatalog = catalogs.find((catalog: ICatalog) => catalog.type === 'products');

        if (!productCatalog) {
            return [];
        }


        // 3. Buscar elementos do catálogo de produtos
        const elementsResponse = await apiRequest.call(this, 'GET', `catalogs/${productCatalog.id}/elements`, {});

        if (!elementsResponse?._embedded?.elements) {
            return [];
        }

        const elements = elementsResponse._embedded.elements;

        const products = elements.map((el: ICatalogElement) => ({
            name: el.name,
            value: el.id,
        }));

        return products;

    } catch (error) {
        console.error('[getPurchaseProducts] ❌ Erro ao buscar produtos:', error);
        return [];
    }
});

export const getPurchaseCatalogCustomFields = cacheOptionsRequest(async function getPurchaseCatalogCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {

		// 1. Buscar catálogos disponíveis
		const catalogsResponse = await apiRequest.call(this, 'GET', 'catalogs', {});

		if (!catalogsResponse?._embedded?.catalogs) {
			return [];
		}

		const catalogs = catalogsResponse._embedded.catalogs;
		catalogs.forEach((catalog: ICatalog) => {
		});

		// 2. Encontrar catálogo de invoices (type = "invoices")
		let invoicesCatalog = catalogs.find((catalog: ICatalog) => catalog.type === 'invoices');

		// Se não encontrou tipo "invoices", tentar alternativas
		if (!invoicesCatalog) {
			const alternativeNames = ['invoice', 'fatura', 'compra', 'purchase'];
			invoicesCatalog = catalogs.find((catalog: ICatalog) =>
				alternativeNames.some(name =>
					catalog.name?.toLowerCase().includes(name)
				)
			);
		}

		if (!invoicesCatalog) {
			return [];
		}


		// 3. Buscar custom fields do catálogo de invoices
		const cfResponse = await apiRequest.call(this, 'GET', `catalogs/${invoicesCatalog.id}/custom_fields`, {});

		if (!cfResponse?._embedded?.custom_fields) {
			return [];
		}

		const customFields = cfResponse._embedded.custom_fields;

		// Filtrar campos que já estão na interface principal
		const filteredFields = customFields.filter((field: ICustomField) => {
			const excludedCodes = ['BILL_STATUS', 'BILL_PRICE', 'ITEMS', 'PAYER', 'BILL_PAYMENT_DATE', 'CREATED_AT', 'BILL_CREATE_DATE'];
			return !excludedCodes.includes(field.code);
		});


		return filteredFields.map((field: ICustomField) => ({
			name: `${field.name} (${field.type})`,
			value: JSON.stringify({ id: field.id, type: field.type }),
		}));

	} catch (error) {
		console.error('[getPurchaseCatalogCustomFields] ❌ Erro ao buscar custom fields:', error);
		return [];
	}
});

export const getTags = cacheOptionsRequest(async function getTags(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const resource = await this.getNodeParameter('resource', 0);

	if (!resource) {
		throw new NodeOperationError(this.getNode(), 'No data got returned');
	}

	const tagsResponseData: Array<IResponseData<'tags', ITag>> = await apiRequestAllItems.call(
		this,
		'GET',
		`${resource}/tags`,
		{},
	);

	const tags = tagsResponseData.reduce((acc: ITag[], response) => {
		if (!response?._embedded) return acc;
		acc.push(...response._embedded?.tags);
		return acc;
	}, []);

	if (!tags?.length) {
		return [];
	}

	return tags.map((field) => ({
		name: field.name.length > 30 ? `${field.name.slice(0, 30)}...` : field.name,
		value: field.id,
	}));
});

export const getTaskTypes = cacheOptionsRequest(async function getTaskTypes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountInfo: IAccount = await apiRequest.call(
		this,
		'GET',
		`account`,
		{},
		{ with: 'task_types' },
	);

	const taskTypes = accountInfo._embedded.task_types;

	return taskTypes.map((field) => ({
		name: field.name.length > 30 ? `${field.name.slice(0, 30)}...` : field.name,
		value: field.id,
	}));
});

// Invoice Status options - carrega opções de status do catálogo de invoices
export const getInvoiceStatusOptions = cacheOptionsRequest(async function getInvoiceStatusOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		// 1. Encontrar catálogo de invoices
		const catalogsResponseData = await apiRequestAllItems.call(this, 'GET', 'catalogs', {});
		const catalogs = catalogsResponseData.flatMap((data) => {
			if (!data?._embedded?.catalogs) return [];
			return data._embedded.catalogs;
		});

		const invoicesCatalog = catalogs.find((catalog: ICatalog) => catalog.type === 'invoices');

		if (!invoicesCatalog) {
			return [
				{ name: 'Created', value: 'Created' },
				{ name: 'Pending', value: 'Pending' },
				{ name: 'Paid', value: 'Paid' },
				{ name: 'Cancelled', value: 'Cancelled' }
			];
		}

		// 2. Obter custom fields do catálogo
		const fieldsResponse = await apiRequest.call(this, 'GET', `catalogs/${invoicesCatalog.id}/custom_fields`);
		const customFields = fieldsResponse._embedded?.custom_fields || [];

		// 3. Encontrar campo de status
		let statusField = customFields.find((f: any) => f.code === 'BILL_STATUS');
		if (!statusField) {
			statusField = customFields.find((f: any) =>
				['STATUS', 'INVOICE_STATUS', 'PURCHASE_STATUS'].includes(f.code) ||
				(f.type === 'select' && f.name?.toLowerCase().includes('status'))
			);
		}

		if (!statusField) {
			return [
				{ name: 'Created', value: 'Created' },
				{ name: 'Pending', value: 'Pending' },
				{ name: 'Paid', value: 'Paid' },
				{ name: 'Cancelled', value: 'Cancelled' }
			];
		}

		// 4. Obter opções do campo de status
		const statusOptions = statusField.enums || [];

		if (statusOptions.length === 0) {
			return [
				{ name: 'Created', value: 'Created' },
				{ name: 'Pending', value: 'Pending' },
				{ name: 'Paid', value: 'Paid' },
				{ name: 'Cancelled', value: 'Cancelled' }
			];
		}

		// 5. Converter para formato do n8n
		return statusOptions.map((option: any) => ({
			name: option.value || option.name || 'Unknown',
			value: option.value || option.name || 'Unknown'
		}));

	} catch (error) {
		console.error('[getInvoiceStatusOptions] Erro ao carregar opções de status:', error);
		// Retornar opções padrão em caso de erro
		return [
			{ name: 'Created', value: 'Created' },
			{ name: 'Pending', value: 'Pending' },
			{ name: 'Paid', value: 'Paid' },
			{ name: 'Cancelled', value: 'Cancelled' }
		];
	}
});

export const getTransactionStatusOptions = cacheOptionsRequest(async function getTransactionStatusOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		// 1. Encontrar catálogo de produtos
		const catalogsResponseData = await apiRequestAllItems.call(this, 'GET', 'catalogs', {});
		const catalogs = catalogsResponseData.flatMap((data) => {
			if (!data?._embedded?.catalogs) return [];
			return data._embedded.catalogs;
		});

		const productsCatalog = catalogs.find((catalog: ICatalog) => catalog.type === 'products');

		if (!productsCatalog) {
			return [];
		}

		// 2. Obter custom fields do catálogo
		const fieldsResponse = await apiRequest.call(this, 'GET', `catalogs/${productsCatalog.id}/custom_fields`);
		const customFields = fieldsResponse._embedded?.custom_fields || [];

		// 3. Encontrar campo de status
		let statusField = customFields.find((f: any) => f.name === 'Status');

		if (!statusField) {
			return [];
		}

		// 4. Obter opções do campo de status
		const statusOptions = statusField.enums || [];

		if (statusOptions.length === 0) {
			return [];
		}

		// 5. Converter para formato do n8n
		return statusOptions.map((option: any) => ({
			name: option.value || option.name || 'Unknown',
			value: option.id || option.value || 'Unknown'
		}));

	} catch (error) {
		console.error('[getTransactionStatusOptions] Erro ao carregar opções de status:', error);
		return [];
	}
});

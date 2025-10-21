import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../transport';

interface ILinkItem {
	entity_id: number;
	to_entity_id: number;
	to_entity_type: string;
	metadata?: {
		main_contact?: boolean;
		quantity?: number;
		catalog_id?: number;
		updated_by?: number;
	};
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const entityType = this.getNodeParameter('entity_type', index) as string;
	const jsonParams = this.getNodeParameter('json', index, false) as boolean;

	const endpoint = `${entityType}/link`;
	const method = 'POST';

	if (jsonParams) {
		const jsonString = this.getNodeParameter('jsonString', index) as string;
		const responseData = await apiRequest.call(this, method, endpoint, JSON.parse(jsonString));
		return responseData as IDataObject | IDataObject[];
	}

	const linksCollection = this.getNodeParameter('links', index) as { link: ILinkItem[] };

	// Construir payload limpando metadata vazia
	const payload = linksCollection.link.map((linkItem) => {
		const body: IDataObject = {
			entity_id: linkItem.entity_id,
			to_entity_id: linkItem.to_entity_id,
			to_entity_type: linkItem.to_entity_type,
		};

		// Adicionar metadata apenas se houver valores
		if (linkItem.metadata) {
			const metadata: IDataObject = {};
			
			if (typeof linkItem.metadata.main_contact === 'boolean') {
				metadata.main_contact = linkItem.metadata.main_contact;
			}
			if (linkItem.metadata.quantity) {
				metadata.quantity = linkItem.metadata.quantity;
			}
			if (linkItem.metadata.catalog_id) {
				metadata.catalog_id = linkItem.metadata.catalog_id;
			}
			if (linkItem.metadata.updated_by) {
				metadata.updated_by = linkItem.metadata.updated_by;
			}
			
			if (Object.keys(metadata).length > 0) {
				body.metadata = metadata;
			}
		}

		return body;
	});

	const responseData = await apiRequest.call(this, method, endpoint, payload);
	return (responseData as any)?._embedded?.links ?? responseData;
}


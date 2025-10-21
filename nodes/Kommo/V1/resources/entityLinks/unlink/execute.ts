import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest } from '../../../transport';

interface IUnlinkItem {
	entity_id: number;
	to_entity_id: number;
	to_entity_type: string;
	metadata?: {
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

	const endpoint = `${entityType}/unlink`;
	const method = 'POST';

	if (jsonParams) {
		const jsonString = this.getNodeParameter('jsonString', index) as string;
		const responseData = await apiRequest.call(this, method, endpoint, JSON.parse(jsonString));
		return responseData as IDataObject | IDataObject[];
	}

	const unlinksCollection = this.getNodeParameter('unlinks', index) as { unlink: IUnlinkItem[] };

	// Construir payload limpando metadata vazia
	const payload = unlinksCollection.unlink.map((unlinkItem) => {
		const body: IDataObject = {
			entity_id: unlinkItem.entity_id,
			to_entity_id: unlinkItem.to_entity_id,
			to_entity_type: unlinkItem.to_entity_type,
		};

		// Adicionar metadata apenas se houver valores
		if (unlinkItem.metadata) {
			const metadata: IDataObject = {};
			
			if (unlinkItem.metadata.catalog_id) {
				metadata.catalog_id = unlinkItem.metadata.catalog_id;
			}
			if (unlinkItem.metadata.updated_by) {
				metadata.updated_by = unlinkItem.metadata.updated_by;
			}
			
			if (Object.keys(metadata).length > 0) {
				body.metadata = metadata;
			}
		}

		return body;
	});

	const responseData = await apiRequest.call(this, method, endpoint, payload);
	// Unlink retorna 204 (sem body), então retornamos mensagem de sucesso
	return responseData || { success: true, unlinked: payload.length };
}


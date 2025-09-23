import { IExecuteFunctions, NodeOperationError, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../../transport';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;
	const confirmDeletion = this.getNodeParameter('confirmDeletion', index, false) as boolean;

	// Validar ID do webhook
	if (!webhookId || webhookId.trim() === '') {
		throw new NodeOperationError(this.getNode(), 'Webhook ID is required', {
			description: 'Provide the ID of the webhook you want to delete.',
		});
	}

	// Verificar confirmação
	if (!confirmDeletion) {
		throw new NodeOperationError(this.getNode(), 'Deletion not confirmed', {
			description: 'You must confirm the deletion by checking the "Confirm Deletion" option.',
		});
	}

	try {
		// Primeiro, obter informações do webhook antes de deletar (para log)
		let webhookInfo: any = null;
		try {
			webhookInfo = await apiRequest.call(this, 'GET', `webhooks/${webhookId}`);
		} catch (error: unknown) {
			// Se não conseguir obter info, continuar com a deleção
			if (error instanceof Error) {
				console.warn(`Could not retrieve webhook info before deletion: ${error.message}`);
			} else {
				console.warn(`Could not retrieve webhook info before deletion: An unknown error occurred`);
			}
		}

		// Deletar o webhook
		await apiRequest.call(this, 'DELETE', `webhooks/${webhookId}`);

		// Preparar resposta de sucesso
		const response: any = {
			success: true,
			webhook_id: webhookId,
			deleted_at: new Date().toISOString(),
			message: 'Webhook deleted successfully',
		};

		// Adicionar informações do webhook deletado se disponíveis
		if (webhookInfo) {
			response.deleted_webhook = {
				destination: webhookInfo.destination,
				events: webhookInfo.settings || [],
				was_active: !webhookInfo.disabled,
				created_at: webhookInfo.created_at ? new Date(webhookInfo.created_at * 1000).toISOString() : null,
			};
		}

		return this.helpers.returnJsonArray([response]);

	} catch (error: unknown) {
		// Tratar erros específicos
		if (error instanceof NodeOperationError) {
			const httpCode = (error.context as IDataObject)?.httpCode;
			if (httpCode === 404) {
				throw new NodeOperationError(this.getNode(), `Webhook with ID ${webhookId} not found`, {
					description: 'The webhook may have already been deleted or the ID is incorrect.',
				});
			}

			if (httpCode === 403) {
				throw new NodeOperationError(this.getNode(), 'Insufficient permissions to delete webhook', {
					description: 'Your API token does not have permission to delete webhooks.',
				});
			}

			if (httpCode === 409) {
				throw new NodeOperationError(this.getNode(), 'Cannot delete webhook', {
					description: 'The webhook cannot be deleted due to active dependencies or restrictions.',
				});
			}
		}

		// Re-throw outros erros
		throw error;
	}
}

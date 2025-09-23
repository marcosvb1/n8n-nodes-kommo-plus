/**
 * Utilitários para determinar endpoints corretos da API do Kommo
 */

/**
 * Normaliza IDs para garantir formato correto
 */
export function normalizeId(id: string | number | undefined): string | undefined {
	if (id === undefined || id === null || id === '') {
		return undefined;
	}

	return String(id).trim();
}

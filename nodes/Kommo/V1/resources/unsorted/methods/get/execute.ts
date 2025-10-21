import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../../transport';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const qs = {} as IDataObject;
	const body = {} as IDataObject;

	const category = (await this.getNodeParameter('category', index)) as string;

	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	if (!returnAll) {
		const page = this.getNodeParameter('page', index) as number;
		qs.page = page;
	}
	const limit = this.getNodeParameter('limit', index) as number;
	qs.limit = limit;

	const endpoint = `leads/unsorted/${category}`;
	const method = 'GET';

    if (returnAll) {
        const pages = await apiRequestAllItems.call(this, method, endpoint, body, qs);
        const items = pages.flatMap((p: any) => p?._embedded?.unsorted ?? p?._embedded?.leads ?? []);
        return items as IDataObject[];
    }

    const responseData = await apiRequest.call(this, method, endpoint, body, qs);
    return (
        (responseData as any)?._embedded?.unsorted ??
        (responseData as any)?._embedded?.leads ??
        (responseData as any)
    );
}



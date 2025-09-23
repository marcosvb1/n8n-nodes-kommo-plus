import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const body = {} as IDataObject;
	const qs = {} as IDataObject;
    const simplify = this.getNodeParameter('simplify', 0, true) as boolean;

	//---------------------------------------------------------------------------------

	const returnAll = this.getNodeParameter('returnAll', 0) as boolean;

	//------------------------------Add pagination-------------------------------------
	if (!returnAll) {
		const page = this.getNodeParameter('page', 0) as number;
		qs.page = page;
	}
	const limit = this.getNodeParameter('limit', 0) as number;
	qs.limit = limit;

	//---------------------------------------------------------------------------------

	const requestMethod = 'GET';
	const endpoint = `catalogs`;

    if (returnAll) {
        const pages = await await apiRequestAllItems.call(
            this,
            requestMethod,
            endpoint,
            body,
            qs,
        );
        if (simplify) {
            const catalogs = pages.flatMap((page: any) => page?._embedded?.catalogs ?? []);
            return this.helpers.returnJsonArray(catalogs);
        }
        return this.helpers.returnJsonArray(pages);
    }

    const responseData = await apiRequest.call(this, requestMethod, endpoint, body, qs);
    if (simplify) {
        const catalogs = (responseData as any)?._embedded?.catalogs ?? [];
        return this.helpers.returnJsonArray(catalogs);
    }
    return this.helpers.returnJsonArray(responseData);
}

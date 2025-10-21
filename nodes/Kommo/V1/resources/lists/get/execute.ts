import { IDataObject, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../../transport';

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const body = {} as IDataObject;
	const qs = {} as IDataObject;

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
        return pages.flatMap((page: any) => page?._embedded?.catalogs ?? []);
    }

    const responseData = await apiRequest.call(this, requestMethod, endpoint, body, qs);
    return (responseData as any)?._embedded?.catalogs ?? responseData;
}

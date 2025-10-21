import { AllEntities, Entity, PropertiesOf } from 'n8n-workflow';

type IKommoMap = {
	account: 'getInfo';
	leads: 'getLeads' | 'createLeads' | 'createLeadsComplex' | 'updateLeads';
	contacts: 'getContacts' | 'createContacts' | 'updateContacts';
	companies: 'getCompany' | 'createCompany' | 'updateCompany';
	notes: 'getNotes' | 'createNotes' | 'updateNotes';
	customers: 'getCustomers' | 'createCustomers' | 'updateCustomers' | 'setCustomersMode';
	unsorted: 'get' | 'create' | 'accept' | 'link' | 'reject' | 'summary';
	pipelines: 'get' | 'create' | 'update' | 'remove';
	statuses: 'get' | 'create' | 'update' | 'remove';
	catalogs: 'get' | 'create' | 'update' | 'getElements' | 'createElements' | 'updateElements';
	tasks: 'getTasks' | 'createTasks' | 'updateTasks';
	lists:
		| 'getLists'
		| 'addLists'
		| 'updateLists'
		| 'getListElements'
		| 'addListElements'
		| 'updateListElements';
	transactions: 'get' | 'create' | 'update';
	invoices: 'getInvoices' | 'createInvoices' | 'updateInvoices';
	webhooks: 'create' | 'get' | 'delete';
	entityLinks: 'get' | 'link' | 'unlink';
};

export type IKommo = AllEntities<IKommoMap>;

export type IAccountKommo = Entity<IKommoMap, 'account'>;
export type ILeadsKommo = Entity<IKommoMap, 'leads'>;
export type IContactsKommo = Entity<IKommoMap, 'contacts'>;
export type ICompaniesKommo = Entity<IKommoMap, 'companies'>;
export type ICustomersKommo = Entity<IKommoMap, 'customers'>;
export type IUnsortedKommo = Entity<IKommoMap, 'unsorted'>;
export type IPipelinesKommo = Entity<IKommoMap, 'pipelines'>;
export type IStatusesKommo = Entity<IKommoMap, 'statuses'>;
export type ICatalogsKommo = Entity<IKommoMap, 'catalogs'>;
export type ITasksKommo = Entity<IKommoMap, 'tasks'>;
export type INotesKommo = Entity<IKommoMap, 'notes'>;
export type IListsKommo = Entity<IKommoMap, 'lists'>;
export type ITransactionsKommo = Entity<IKommoMap, 'transactions'>;
export type IInvoicesKommo = Entity<IKommoMap, 'invoices'>;
export type IWebhooksKommo = Entity<IKommoMap, 'webhooks'>;
export type IEntityLinksKommo = Entity<IKommoMap, 'entityLinks'>;

export type IAccountProperties = PropertiesOf<IAccountKommo>;
export type ILeadsProperties = PropertiesOf<ILeadsKommo>;
export type IContactsProperties = PropertiesOf<IContactsKommo>;
export type ICompaniesProperties = PropertiesOf<ICompaniesKommo>;
export type IUnsortedProperties = PropertiesOf<IUnsortedKommo>;
export type IPipelinesProperties = PropertiesOf<IPipelinesKommo>;
export type IStatusesProperties = PropertiesOf<IStatusesKommo>;
export type ICatalogsProperties = PropertiesOf<ICatalogsKommo>;
export type ITasksProperties = PropertiesOf<ITasksKommo>;
export type INotesProperties = PropertiesOf<INotesKommo>;
export type IListsProperties = PropertiesOf<IListsKommo>;
export type ITransactionsProperties = PropertiesOf<ITransactionsKommo>;
export type ICustomersProperties = PropertiesOf<ICustomersKommo>;
export type IInvoicesProperties = PropertiesOf<IInvoicesKommo>;
export type IWebhooksProperties = PropertiesOf<IWebhooksKommo>;
export type IEntityLinksProperties = PropertiesOf<IEntityLinksKommo>;

export interface IAttachment {
	fields: {
		item?: object[];
	};
	actions: {
		item?: object[];
	};
}

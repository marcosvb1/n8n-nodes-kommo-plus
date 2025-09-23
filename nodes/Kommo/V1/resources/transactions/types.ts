
import { ICustomFieldValuesForm } from '../../Interface';

export interface ITransactionModelForm {
	name: string;
	custom_fields_values: ICustomFieldValuesForm;
}

export interface IFormTransaction {
	transaction: Array<ITransactionModelForm>;
}

export interface IUpdateTransactionForm {
	transaction: Array<ITransactionModelForm & { id: number }>;
}

export type Transaction = {
	id: number;
	name: string;
	custom_fields_values: Record<string, unknown>[];
};

export type RequestTransactionUpdate = Partial<Exclude<Transaction, 'id'>> &
	Pick<Transaction, 'id'>;
export type RequestTransactionCreate = Partial<Exclude<Transaction, 'id'>> &
	Pick<Transaction, 'name'>;

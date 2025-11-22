import { INodeProperties } from 'n8n-workflow';
import { ICustomFieldValuesForm, ITypeField } from '../../Interface';
import { isJson } from '../../helpers/isJson';
import { isNumber } from '../../helpers/isNumber';
import { stringToArray } from '../../helpers/stringToArray';

export const addCustomFieldDescription = (loadOptionsMethod: string): INodeProperties => {
	return {
		displayName: 'Custom Fields',
		name: 'custom_fields_values',
		placeholder: 'Add custom field',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				displayName: 'Custom Field',
				name: 'custom_field',
				values: [
					{
						displayName: 'Name',
						name: 'data',
						type: 'options',
						typeOptions: {
							loadOptionsMethod,
						},
						default: '',
						required: true,
					},
					// {
					// 	displayName: 'Enum ID',
					// 	name: 'enum_id',
					// 	type: 'number',
					// 	default: null,
					// },
					// {
					// 	displayName: 'Enum Code',
					// 	name: 'enum_code',
					// 	type: 'string',
					// 	default: '',
					// },
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},
		],
	};
};

export const makeCustomFieldReqObject = (customFieldsValues: ICustomFieldValuesForm) => {
	const list = customFieldsValues?.custom_field;
	if (!Array.isArray(list) || list.length === 0)
		return [] as Array<{
			id: number;
			values: Array<{ value?: number | boolean | string; enum_id?: number; enum_code?: string }>;
		}>;
	return list.reduce(
		(
			acc: Array<{
				id: number;
				values: Array<{
					value?: number | boolean | string;
					enum_id?: number;
					enum_code?: string;
				}>;
			}>,
			cf,
		) => {
			// tslint:disable-next-line: variable-name
			let value, enum_id, enum_code;
			let data: { id: number; type: ITypeField };
			try {
				data = JSON.parse(cf.data) as { id: number; type: ITypeField };
			} catch (error) {
				return acc; // Skip invalid data
			}

			if (typeof cf.value === 'object') {
				return [...acc, { id: data.id, values: cf.value }];
			}

			// Safe JSON parse check
			let parsedValue;
			try {
				parsedValue = JSON.parse(cf.value);
			} catch (e) {
				parsedValue = undefined;
			}

			if (
				typeof cf.value === 'string' &&
				parsedValue !== undefined &&
				!isNumber(cf.value) &&
				typeof parsedValue !== 'boolean'
			) {
				return [...acc, { id: data.id, values: parsedValue }];
			}

			if (
				typeof cf.value === 'string' &&
				['multiselect', 'radiobutton', 'category'].includes(data.type) &&
				cf.value.split(',').length > 1
			) {
				return [
					...acc,
					{
						id: data.id,
						values: stringToArray(cf.value).map((value) =>
							typeof value === 'number' ? { enum_id: value } : { value },
						),
					},
				];
			}

			switch (data.type) {
				case 'checkbox':
					if (
						typeof cf.value === 'string' &&
						['нет', 'no', 'false', 'off'].includes(cf.value.toLowerCase())
					) {
						value = false;
						break;
					}
					value = Boolean(cf.value);
					break;
				case 'date':
				case 'date_time':
				case 'birthday':
					value = Number(cf.value);
					break;
				case 'text':
				case 'numeric':
				case 'textarea':
				case 'price':
				case 'streetaddress':
				case 'tracking_data':
				case 'monetary':
				case 'url':
				case 'multitext':
				case 'smart_address':
					value = String(cf.value);
					break;
				case 'select':
				case 'multiselect':
				case 'radiobutton':
				case 'category':
					if (isNumber(cf.value)) {
						enum_id = Number(cf.value);
					} else {
						value = String(cf.value);
					}
					break;
				case 'legal_entity':
				case 'items':
				case 'linked_entity':
				case 'file':
				case 'payer':
				case 'supplier':
				case 'tracking_data':
					try {
						value = JSON.parse(cf.value);
					} catch (e) {
						value = cf.value; // Fallback to raw value if parse fails
					}
					break;
				case 'chained_list':
					break;
				default:
					break;
			}
			if (!enum_id && !enum_code) {
				if (typeof value === 'undefined') return acc;
				// Allow 0 and false, only filter out undefined/null/empty string
				if (value === null || value === '') return acc;
			}
			const existRecord = acc.filter((el) => el.id === data.id);
			if (existRecord.length) {
				const values = [...existRecord[0].values, { value, enum_id, enum_code }];
				acc = [...acc.filter((el) => el.id !== data.id), { id: existRecord[0].id, values }];
			} else {
				acc.push({ id: data.id, values: [{ value, enum_id, enum_code }] });
			}
			return acc;
		},
		[],
	);
};

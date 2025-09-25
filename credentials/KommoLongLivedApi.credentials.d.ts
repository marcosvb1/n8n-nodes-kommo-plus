import { ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class KommoLongLivedApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    icon: "file:kommo_logo.svg";
    properties: INodeProperties[];
}

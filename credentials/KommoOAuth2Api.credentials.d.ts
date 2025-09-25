import { ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class KommoOAuth2Api implements ICredentialType {
    name: string;
    extends: string[];
    displayName: string;
    documentationUrl: string;
    icon: "file:kommo_logo.svg";
    properties: INodeProperties[];
}

import {AccountInfo, CryptoProvider, PublicClientApplication} from '@azure/msal-node'

export declare type AuthData = {
    readonly clientApplication: PublicClientApplication
    readonly cryptoProvider: CryptoProvider
    readonly authCodeUrlParams: AuthCodeUrlParams
    readonly authCodeRequest: AuthCodeRequest
    readonly pkceCodes: PkceCodes
    readonly account: AccountInfo | null
}

export declare type AuthCodeUrlParams = {
    readonly scopes: string[]
    readonly redirectUri: string
}

export declare type AuthCodeRequest = {
    readonly scopes: string[]
    readonly redirectUri: string
    readonly code: null
}

export declare type PkceCodes = {
    readonly challengeMethod: string
    readonly verifier: string
    readonly challenge: string
}
import {AccountInfo, CryptoProvider, PublicClientApplication} from '@azure/msal-node'

export declare type AuthData = {
    clientApplication: PublicClientApplication
    cryptoProvider: CryptoProvider
    authCodeUrlParams: AuthCodeUrlParams
    authCodeRequest: AuthCodeRequest
    pkceCodes: PkceCodes
    account: AccountInfo | null
}

export declare type AuthCodeUrlParams = {
    scopes: string[]
    redirectUri: string
}

export declare type AuthCodeRequest = {
    scopes: string[]
    redirectUri: string
    code: null
}

export declare type PkceCodes = {
    challengeMethod: string
    verifier: string
    challenge: string
}
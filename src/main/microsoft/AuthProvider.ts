import {AuthenticationResult, CryptoProvider, LogLevel, PublicClientApplication} from '@azure/msal-node'
import {AuthCodeRequest, AuthCodeUrlParams, AuthData, PkceCodes} from '../../@types/AuthData'
import {protocol} from 'electron'
import url from 'url'
import path from 'path'

require('dotenv').config()

const CUSTOM_FILE_PROTOCOL_NAME = process.env.REDIRECT_URI!.split(':')[0]

const MSAL_CONFIG = {
    auth: {
        clientId: process.env.CLIENT_ID!,
        authority: `${process.env.AAD_ENDPOINT_HOST}${process.env.TENANT_ID}`,
        redirectUri: process.env.REDIRECT_URI!
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel: LogLevel, message: string) {
                console.log(message)
            },
            piiLoggingEnabled: false,
            logLevel: LogLevel.Verbose
        }
    }
}

export function apply(): AuthData {
    const clientApplication = new PublicClientApplication(MSAL_CONFIG)
    const account = null

    const cryptoProvider = new CryptoProvider()

    const requestScopes = ['XboxLive.signin', 'offline_access']
    const redirectUri = process.env.REDIRECT_URI!

    const authCodeUrlParams: AuthCodeUrlParams = {
        scopes: requestScopes,
        redirectUri: redirectUri
    }

    const authCodeRequest: AuthCodeRequest = {
        scopes: requestScopes,
        redirectUri: redirectUri,
        code: null
    }

    const pkceCodes: PkceCodes = {
        challengeMethod: 'S256',
        verifier: '',
        challenge: ''
    }

    return {
        clientApplication: clientApplication,
        cryptoProvider: cryptoProvider,
        authCodeUrlParams: authCodeUrlParams,
        authCodeRequest: authCodeRequest,
        pkceCodes: pkceCodes,
        account: account
    }
}

export async function login(authWindow: Electron.BrowserWindow, authData: AuthData) {
    const authResult = await getTokenInteractive(authWindow, authData)
    const res = await handleResponse(authResult, authData)
    return {
        ...authData,
        account: res
    }
}

export async function logout(authData: AuthData) {
    if (authData.account) {
        await authData.clientApplication.getTokenCache().removeAccount(authData.account);
    }
    return {
        ...authData,
        account: null
    }
}

async function handleResponse(response: AuthenticationResult | null, authData: AuthData) {
    return response !== null ? response.account : await getAccount(authData)
}

async function getAccount(authData: AuthData) {
    const cache = authData.clientApplication.getTokenCache()
    const currentAccounts = await cache.getAllAccounts()

    if (currentAccounts === null) {
        console.log('No accounts detected')
        return null
    }

    if (currentAccounts.length > 1) {
        console.log('Multiple accounts detected, need to add choose account code.')
        return currentAccounts[0]
    } else if (currentAccounts.length === 1) {
        return currentAccounts[0]
    } else {
        return null
    }
}

async function getTokenInteractive(authWindow: Electron.BrowserWindow, authData: AuthData) {
    const {verifier, challenge} = await authData.cryptoProvider.generatePkceCodes()

    const authCodeUrlParams = {
        ...authData.authCodeUrlParams,
        scopes: authData.authCodeUrlParams.scopes,
        codeChallenge: challenge,
        codeChallengeMethod: authData.pkceCodes.challengeMethod
    }

    const authCodeUrl = await authData.clientApplication.getAuthCodeUrl(authCodeUrlParams)

    protocol.registerFileProtocol(CUSTOM_FILE_PROTOCOL_NAME, (req, callback) => {
        const requestUrl = url.parse(req.url, true)
        callback(path.normalize(`${__dirname}/${requestUrl.path}`))
    })

    const authCode = await listenForAuthCode(authCodeUrl, authWindow)

    const request = {
        ...authData.authCodeRequest,
        scopes: authData.authCodeUrlParams.scopes,
        code: authCode,
        codeVerifier: verifier
    }

    return await authData.clientApplication.acquireTokenByCode(request)
}

async function listenForAuthCode(navigateUrl: string, authWindow: Electron.BrowserWindow) {
    await authWindow.loadURL(navigateUrl)

    return new Promise((resolve: (authCode: string) => void, reject) => {
        authWindow.webContents.on('will-redirect', (event, responseUrl) => {
            try {
                const parsedUrl = new URL(responseUrl)
                const authCode = parsedUrl.searchParams.get('code')!
                resolve(authCode)
            } catch (err) {
                reject(err)
            }
        })
    })
}
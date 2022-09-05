import {AuthenticationResult, CryptoProvider, LogLevel, PublicClientApplication} from '@azure/msal-node'
import {AuthCodeRequest, AuthCodeUrlParams, AuthData, PkceCodes} from '../../@types/AuthData'
import {protocol} from 'electron'
import url from 'url'
import path from 'path'
import {GetXbox} from './GetXBL'
import {log} from '../../generic/Logger'
import {Option, none, some, fromNullable, chain} from 'fp-ts/Option'
import {GetMinecraft} from './GetMinecraft'
import {pipe} from 'fp-ts/function'
import {Error, GetMinecraftProfile, Ok} from './GetMinecraftProfile'
import {Either, left, right} from 'fp-ts/Either'

const {net} = require('electron')

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

/**
 * Microsoft Authentication Scheme
 * @param authWindow
 * @param authData
 */
export async function loginMicrosoft(authWindow: Electron.BrowserWindow, authData: AuthData) {
    const authResult = await getTokenInteractive(authWindow, authData)
    const account = await handleResponse(authResult, authData)

    const minecraftToken = pipe(
        fromNullable(authResult),
        chain(r => {
            console.log(r.accessToken)
            return some(r.accessToken)
        }),
        chain(authXBL),
        chain(([token]: string[]) => authXSTS(token)),
        chain(([token, uhs]: string[]) => authMinecraft(token, uhs))
    )

    return {
        ...authData,
        account: account
    }
}

export async function logout(authData: AuthData) {
    if (authData.account) {
        await authData.clientApplication.getTokenCache().removeAccount(authData.account)
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

function authXbox(options: string | Electron.ClientRequestConstructorOptions, body: string) {
    const request = net.request(options)
    request.setHeader('Content-Type', 'application/json')
    request.setHeader('Accept', 'application/json')

    request.write(body)

    let token = ''
    let uhs = ''

    request.on('response', (response) => {
        if (response.statusCode === 200)
            response.on('data', (chunk) => {
                const json = JSON.parse(chunk.join()) as GetXbox
                token = json.Token
                uhs = json.DisplayClaims.xui[0].uhs
            })
        else {
            log.error('XBox Authorization error')
            log.error(` StatusCode: ${response.statusCode}`)
            log.error(` StatusMessage: ${response.statusCode}`)
        }
    })

    request.end()

    if (token == '' || uhs == '')
        return none
    return some([token, uhs])
}

/**
 * Get XBL token and XBL uhs from oauth2 access token
 * @param {string} accessToken oauth2 access token
 * @return {Option[string]} Return a tuple of XBL token and XBL uhs
 */
function authXBL(accessToken: string) {
    const options =
        {
            method: 'POST',
            url: 'https://user.auth.xboxlive.com/user/authenticate'
        }

    const body = JSON.stringify({
        Properties: {
            AuthMethod: 'RPS',
            SiteName: 'user.auth.xboxlive.com',
            RpsTicket: `d=${accessToken}`
        },
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT'
    })

    return authXbox(options, body)
}

/**
 * Get XSTS token and XSTS uhs from XBL token
 * @param {string} XBLToken XBL token
 * @return {Option[string]} Return a tuple of XSTS token and XSTS uhs
 */
function authXSTS(XBLToken: string) {
    const options =
        {
            method: 'POST',
            url: 'https://xsts.auth.xboxlive.com/xsts/authorize'
        }
    const body = JSON.stringify({
        Properties: {
            SandboxId: 'RETAIL',
            UserTokens: [
                `${XBLToken}`
            ]
        },
        RelyingParty: 'rp://api.minecraftservices.com/',
        TokenType: 'JWT'
    })

    return authXbox(options, body)
}

/**
 * Get Minecraft access token
 * @param {string} XSTSUhs
 * @param {string} XSTSToken
 */
function authMinecraft(XSTSToken: string, XSTSUhs: string) {
    const request = net.request({
        method: 'POST',
        url: 'https://api.minecraftservices.com/authentication/login_with_xbox'
    })
    request.setHeader('Content-Type', 'application/json')
    request.setHeader('Accept', 'application/json')

    const body = JSON.stringify({
        identityToken: `XBL3.0 x=${XSTSUhs};${XSTSToken}`
    })

    request.write(body)

    let accessToken: Option<string> = none

    request.on('response', (response) => {
        if (response.statusCode === 200)
            response.on('data', (chunk) => {
                const json = JSON.parse(chunk.join()) as GetMinecraft
                accessToken = some(json.access_token)
            })
        else {
            log.error('Minecraft Authorization error')
            log.error(` StatusCode: ${response.statusCode}`)
            log.error(` StatusMessage: ${response.statusCode}`)
        }
    })

    request.end()

    return accessToken
}

async function getMinecraftProfile(minecraftToken: string): Promise<Either<string, GetMinecraftProfile>> {
    const response = await fetch('https://api.minecraftservices.com/minecraft/profile', {headers: {Authorization: `Bearer ${minecraftToken}`}})

    switch (response.status){
        case 200:
            if((await response.json()).id != undefined)
                return right(await response.json() as Ok)
            else return right(await response.json() as Error)
        default:
            return left(`status ${response.status}`)
    }
}
import {Configuration, CryptoProvider, PublicClientApplication, RefreshTokenRequest} from '@azure/msal-node'
import * as url from 'url'
import path from 'path'
import protocol = Electron.protocol

const MSAL_CONFIG: Configuration = {
    auth: {
        clientId: process.env.CLIENT_ID!,
        authority: `${process.env.AAD_ENDPOINT_HOST}${process.env.TENANT_ID}`
    }
}

const pca = new PublicClientApplication(MSAL_CONFIG)

const redirectUri = 'msal://redirect'

const clientApplication = new PublicClientApplication(MSAL_CONFIG)

const cryptoProvider = new CryptoProvider()

const pkceCodes = {
    challengeMethod: 'S256',
    verifier: '',
    challenge: ''
}

export async function getTokenInteractive(authWindow: Electron.BrowserWindow, tokenRequest: RefreshTokenRequest) {
    const {verifier, challenge} = await cryptoProvider.generatePkceCodes()

    const authCodeUrlParams = {
        redirectUri: redirectUri,
        scopes: tokenRequest.scopes,
        codeChallenge: challenge,
        codeChallengeMethod: pkceCodes.challengeMethod
    }

    const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParams)

    protocol.registerFileProtocol(redirectUri.split(':')[0], (req, callback) => {
        const requestUrl = url.parse(req.url, true)
        callback(path.normalize(`${__dirname}/${requestUrl.path}`))
    })

    const authCode = await listenForAuthCode(authCodeUrl, authWindow)

    return await pca.acquireTokenByCode({
        redirectUri: redirectUri,
        scopes: tokenRequest.scopes,
        code: authCode,
        codeVerifier: verifier
    })
}

function listenForAuthCode(navigateUrl: string, authWindow: Electron.BrowserWindow) {
    authWindow.loadURL(navigateUrl).then()

    return new Promise((resolve: (authCode: string) => void, reject) => {
        authWindow.webContents.on('will-redirect', (event, responseUrl) => {
            try {
                const parsedUrl = new URL(responseUrl)
                const authCode = parsedUrl.searchParams.get('code')!
                resolve(authCode)
            } catch (error) {
                reject(error)
            }
        })
    })
}
import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import {jsonToModSearchParams} from '../NamagomiApi'
import {ModSearchParam} from './ModSearchParam';
import {sampleGomiJson} from "../sample";
import path from "path";
import fetch from 'electron-fetch'
import {devDir, devModsDir, mainDir, ModsDir} from '../../../settings/localPath'
import {pipeline} from "stream/promises";
import * as fs from "fs";
import {createWriteStream} from "fs";
import {getFileName} from "../../../settings/mappings";

const curseForgeHeaders = {
    headers: {
        'Accept': 'application/json',
        'x-api-key': curseForgeApiKey
    }
}

const fetchJson = async (url: URL) => {
    const response = await fetch(url.toString(), curseForgeHeaders)
    return response.json()
}
const getModFileUrl = async (param: ModSearchParam) => {
    if (param.directUrl != '')
        return new URL(param.directUrl)
    const url = new URL(path.join(curseForgeApiBaseUrl, '/v1/mods', param.modid, 'files'))
    if (!url.searchParams.has('gameVersion'))
        url.searchParams.append('gameVersion', param.gameVersion)
    const json = fetchJson(url)
    const trimmed = await trimJson(json, param)
    param.displayName = trimmed['displayName'] != null ? trimmed['displayName'] : ''
    if (trimmed.downloadUrl == null) {
        console.info(`modid:${param.modid} gameversion:${param.gameVersion} ${param.displayName} doesn't have download url`)
        return null
    } else
        return new URL(trimmed.downloadUrl)
}

const getModFileUrls = (params: Array<ModSearchParam>) => {
    return params.map(getModFileUrl)
}

const trimJson = async (json: any, param: ModSearchParam) => {
    const pattern = param.fileNamePattern
    return await json.then((data: any) => {
        const single = data.data.find((j: any) => j.fileName.indexOf(pattern) != -1)
        if (single == null)
            console.error(`${param.modid} ${param.gameVersion} ${param.fileNamePattern} not found`)
        return single
    })
}

async function downloadModFile(url: URL) {
    const fileName = getFileName(url.toString())
    const filePath = path.join(ModsDir, fileName)
    if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir)
    if (!fs.existsSync(ModsDir)) fs.mkdirSync(ModsDir)
    if (!fs.existsSync(filePath)) {
        console.log(`downloading ${fileName}`)
        await pipeline(
            (await fetch(url.toString())).body,
            createWriteStream(filePath)
        ).then(() => {
            console.log('[COMPLETE] ' + fileName)
        }).catch(err => {
            console.error(err)
            console.log('[FAILED] ' + fileName + ' ' + url.toString())
        })
    } else
        console.log('[IGNORE] ' + fileName)
}

export const downloadAllModFiles = async () => {
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    await Promise.all(urls.map(async (url) => {
        if (url != null) {
            await downloadModFile(url)
        }
    })).then(() => rmModFiles(params, urls, ''))
}

export const downloadClientModFiles = async () => {
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    await Promise.all(urls.map(async (url, index) => {
        if (url != null && (params[index].side === 'CLIENT' || params[index].side == '')) {
            await downloadModFile(url)
        }
    })).then(() => rmModFiles(params, urls, 'CLIENT'))
}

export const downloadServerModFiles = async () => {
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    Promise.all(urls.map(async (url, index) => {
        if (url != null && (params[index].side === 'SERVER' || params[index].side == '')) {
            await downloadModFile(url)
        }
    })).then(() => rmModFiles(params, urls, 'SERVER'))
}

async function rmModFiles(params: ModSearchParam[], urls: (URL | null)[], side: 'CLIENT' | 'SERVER' | '') {
    const files = fs.readdirSync(ModsDir)

    const remoteFiles = urls
        .filter((url: URL | null, index) => url != null && (params[index].side === '' || params[index].side.includes(side)))
        .map((url: URL | null) =>
            getFileName(url!.toString())
        )

    await Promise.all(files.map((file) => {
        if (!(remoteFiles.includes(file))) {
            fs.rmSync(path.join(ModsDir, file))
            console.log('[DELETE] ' + file)
        }
    }))
}

export const DownloadModFilesDev = async () => {
    const params = jsonToModSearchParams(sampleGomiJson)
    const urls = await Promise.all(getModFileUrls(params))
    await Promise.all(urls.map(async (url) => {
        if (url != null) {
            const fileName = getFileName(url.toString())
            const filePath = path.join(devModsDir, fileName)
            if(!fs.existsSync(devDir)) fs.mkdirSync(devDir)
            if(!fs.existsSync(devModsDir)) fs.mkdirSync(devModsDir)
            if(!fs.existsSync(filePath)) {
                console.log(`downloading ${fileName}`)
                await pipeline(
                    (await fetch(url.toString())).body,
                    createWriteStream(filePath)
                ).then(() => {
                    console.log('[COMPLETE] ' + fileName)
                }).catch(err => {
                    console.error(err)
                    console.log('[FAILED] ' + fileName + ' ' + url.toString())
                })
            }
            else
                console.log('[IGNORE] ' + fileName)
        }
    })).then(()=>rmModFilesDev(params, urls))
}

async function rmModFilesDev(params: ModSearchParam[], urls: (URL | null)[]) {
    const files = fs.readdirSync(devModsDir)

    const remoteFiles = urls
        .filter((url: URL | null) => url != null)
        .map((url: URL | null) =>
            url!.toString().split('/').pop()!.split('?')[0].split('#')[0]
    )
    await Promise.all(files.map((file) => {
        if (!(remoteFiles.includes(file))) {
            fs.rmSync(path.join(devModsDir, file))
            console.log('[DELETE] ' + file)
        }
    }))
}
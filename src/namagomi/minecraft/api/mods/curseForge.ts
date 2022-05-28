import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import {jsonToModSearchParams} from '../NamagomiApi'
import {ModSearchParam} from './ModSearchParam';
import {sampleGomiJson} from "../sample";
import path from "path";
import fetch from 'electron-fetch'
import {devDir, devModsDir, mainDir, ModsDir} from '../../../settings/localPath'
import {pipeline} from "stream/promises";
import {createWriteStream} from "fs";
import * as fs from "fs";

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
    const fileName = url.toString().split('/').pop()!.split('?')[0].split('#')[0];
    const filePath = path.join(ModsDir, fileName)
    if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir)
    if (!fs.existsSync(ModsDir)) fs.mkdirSync(ModsDir)
    if (!fs.existsSync(filePath)) {
        console.log(`downloading ${fileName}`)
        pipeline(
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
    urls.map(async (url, index) => {
        if (url != null) {
            await downloadModFile(url)
        }
    })
}

export const downloadClientModFiles = async () => {
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    urls.map(async (url, index) => {
        if (url != null && (params[index].side === 'CLIENT' || params[index].side == '')) {
            await downloadModFile(url)
        }
    })
}

export const downloadServerModFiles = async () => {
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    urls.map(async (url, index) => {
        if (url != null && (params[index].side === 'SERVER' || params[index].side == '')) {
            await downloadModFile(url)
        }
    })
}

export const DownloadModFilesDev = async () => {
    const params = jsonToModSearchParams(sampleGomiJson)
    const urls = await Promise.all(getModFileUrls(params))
    urls.map(async (url, index) => {
        if (url != null) {
            const fileName = url.toString().split('/').pop()!.split('?')[0].split('#')[0];
            const filePath = path.join(devModsDir, fileName)
            if(!fs.existsSync(devDir)) fs.mkdirSync(devDir)
            if(!fs.existsSync(devModsDir)) fs.mkdirSync(devModsDir)
            if(!fs.existsSync(filePath)) {
                console.log(`downloading ${fileName}`)
                pipeline(
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
    })
}
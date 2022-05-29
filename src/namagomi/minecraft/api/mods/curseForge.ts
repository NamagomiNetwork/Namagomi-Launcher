import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import {jsonToModSearchParams} from '../NamagomiApi'
import {ModSearchParam} from './ModSearchParam';
import path from "path";
import fetch from 'electron-fetch'
import {mainDir, modsDir, namagomiCache, namagomiIgnore} from '../../../settings/localPath'
import {pipeline} from "stream/promises";
import * as fs from "fs";
import {createWriteStream} from "fs";
import {getFileName} from "../../../settings/mappings";
import {mkEmptyFile, NamagomiIgnore} from "./NamagomiIgnore";
import {GitTree} from "../github/GitTree";

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

async function updateModCache() {
    if (!fs.existsSync(namagomiCache)) fs.writeFileSync(namagomiCache, JSON.stringify({}))
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache, 'utf8'))

    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
    cacheJson['mods'] = tree.getData('mod/mod_list.json').data.sha

    fs.writeFileSync(namagomiCache, JSON.stringify(cacheJson))
}

export async function isLatestMods() {
    if (!fs.existsSync(namagomiCache)) fs.writeFileSync(namagomiCache, JSON.stringify({}))
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache, 'utf8'))

    if ('mods' in cacheJson) {
        const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
        return cacheJson['mods'] === tree.getData('mod/mod_list.json').data.sha
    } else return false
}

async function downloadModFile(url: URL) {
    const fileName = getFileName(url.toString())
    const filePath = path.join(modsDir, fileName)
    if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir)
    if (!fs.existsSync(modsDir)) fs.mkdirSync(modsDir)

    if (!fs.existsSync(filePath)) {
        await pipeline(
            (await fetch(url.toString())).body,
            createWriteStream(filePath)
        ).then(() => {
            console.log('downloaded: ' + fileName)
        }).catch(err => {
            console.error(err)
            console.error('failed: ' + fileName + ' ' + url.toString())
        })
    }
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

    await updateModCache()
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

    await updateModCache()
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

    await updateModCache()
}

async function rmModFiles(params: ModSearchParam[], urls: (URL | null)[], side: 'CLIENT' | 'SERVER' | '') {
    const files = fs.readdirSync(modsDir)

    const remoteFiles = urls
        .filter((url: URL | null, index) => url != null && (params[index].side === '' || params[index].side.includes(side)))
        .map((url: URL | null) =>
            getFileName(url!.toString())
        )

    if (!fs.existsSync(namagomiIgnore)) mkEmptyFile(namagomiIgnore)
    const ignoreFiles =
        JSON.parse(fs.readFileSync(namagomiIgnore, 'utf8')) as NamagomiIgnore

    await Promise.all(files.map((file) => {
        if (!(remoteFiles.includes(file) || ignoreFiles.includes(file))) {
            fs.rmSync(path.join(modsDir, file))
            console.log('delete: ' + file)
        }
    }))
}
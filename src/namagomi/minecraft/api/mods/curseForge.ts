import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import {jsonToModSearchParams} from '../NamagomiApi'
import {ModSearchParam} from './ModSearchParam';
import path from "path";
import fetch from 'electron-fetch'
import {configDir, mainDir, minecraftDir, modsDir, namagomiCache, namagomiIgnore} from '../../../settings/localPath'
import {pipeline} from "stream/promises";
import * as fs from "fs";
import {createWriteStream} from "fs";
import {getFileName} from "../../../settings/mappings";
import {mkEmptyNamagomiIgnore, NamagomiIgnore} from "./NamagomiIgnore";
import {GitTree} from "../github/GitTree";
import {Either, isLeft, isRight, left, right} from "fp-ts/Either"

const curseForgeHeaders = {
    headers: {
        'Accept': 'application/json',
        'x-api-key': curseForgeApiKey
    }
}

export const fetchJson = async (url: URL) => {
    const response = await fetch(url.toString(), curseForgeHeaders)
    return response.json()
}
const getModFileUrl = async (param: ModSearchParam) : Promise<Either<string, URL>> => {
    if (param.directUrl != '')
        return right(new URL(param.directUrl))
    const url = new URL(path.join(curseForgeApiBaseUrl, '/v1/mods', param.modid, 'files'))
    if (!url.searchParams.has('gameVersion'))
        url.searchParams.append('gameVersion', param.gameVersion)
    const json = fetchJson(url)
    const trimmed = await trimJson(json, param)
    param.displayName = trimmed['displayName'] != null ? trimmed['displayName'] : ''
    if (trimmed.downloadUrl == null) {
        console.info(`modid:${param.modid} gameversion:${param.gameVersion} ${param.displayName} doesn't have download url`)
        return left(param.modid)
    } else
        return right(new URL(trimmed.downloadUrl))
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
    setupLauncherDirs()
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache, 'utf8'))

    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
    cacheJson['mods'] = tree.getData('mod/mod_list.json').data.sha

    fs.writeFileSync(namagomiCache, JSON.stringify(cacheJson))
}

export async function isLatestMods() {
    setupLauncherDirs()
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache, 'utf8'))

    if ('mods' in cacheJson) {
        const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
        return cacheJson['mods'] === tree.getData('mod/mod_list.json').data.sha
    } else return false
}

async function downloadModFile(url: URL) {
    const fileName = getFileName(url.toString())
    const filePath = path.join(modsDir, fileName)
    setupLauncherDirs()

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
    setupLauncherDirs()
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    const manuallyFiles = [] as string[]

    await Promise.all(urls.map(async (url: Either<string, URL>) => {
        if (isRight(url)) {
            await downloadModFile(url.right)
        } else {
            manuallyFiles.push(url.left)
        }
    })).then(() => rmModFiles(params, urls, ''))

    await updateModCache()

    return await Promise.all(manuallyFiles.map(getWebsiteLink))
}

export const downloadClientModFiles = async () => {
    setupLauncherDirs()
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))

    const manuallyFiles = [] as string[]

    await Promise.all(urls.map(async (url, index) => {
        if (isRight(url) && (params[index].side === 'CLIENT' || params[index].side == '')) {
            await downloadModFile(url.right)
        } else if(isLeft(url)) {
            manuallyFiles.push(url.left)
        }
    })).then(() => rmModFiles(params, urls, 'CLIENT'))

    await updateModCache()

    return manuallyFiles
}

export const downloadServerModFiles = async () => {
    setupLauncherDirs()
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))

    const manuallyFiles = [] as string[]

    Promise.all(urls.map(async (url, index) => {
        if (isRight(url) && (params[index].side === 'SERVER' || params[index].side == '')) {
            await downloadModFile(url.right)
        } else if(isLeft(url)) {
            manuallyFiles.push(url.left)
        }
    })).then(() => rmModFiles(params, urls, 'SERVER'))

    await updateModCache()

    return manuallyFiles
}

async function rmModFiles(params: ModSearchParam[], urls: Either<string, URL>[], side: 'CLIENT' | 'SERVER' | '') {
    const files = fs.readdirSync(modsDir)

    const remoteFiles = urls
        .filter((url, index) =>
            isRight(url) && (params[index].side === '' || params[index].side.includes(side)))
        .map((url) => {
            if(isRight(url))
                return getFileName(url.right.toString());
            else return ""
        })

    if (!fs.existsSync(namagomiIgnore)) mkEmptyNamagomiIgnore(namagomiIgnore)
    const ignoreFiles =
        JSON.parse(fs.readFileSync(namagomiIgnore, 'utf8')) as NamagomiIgnore

    await Promise.all(files.map((file) => {
        if (!(remoteFiles.includes(file) || ignoreFiles.includes(file) || fs.statSync(path.join(modsDir, file)).isDirectory())) {
            fs.rmSync(path.join(modsDir, file))
            console.log('delete: ' + file)
        }
    }))
}

function setupLauncherDirs() {
    if (!fs.existsSync(minecraftDir)) fs.mkdirSync(minecraftDir)
    if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir)
    if (!fs.existsSync(modsDir)) fs.mkdirSync(modsDir)
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir)
    if (!fs.existsSync(namagomiCache)) fs.writeFileSync(namagomiCache, JSON.stringify({}))
    if (!fs.existsSync(namagomiIgnore)) mkEmptyNamagomiIgnore(namagomiIgnore)
}

async function getWebsiteLink(modid: string){
    const response = await fetch(`https://api.curseforge.com/v1/mods/${modid}`, curseForgeHeaders)
    const json = await response.json() as GetMod
    return json.data?.links?.websiteUrl
}
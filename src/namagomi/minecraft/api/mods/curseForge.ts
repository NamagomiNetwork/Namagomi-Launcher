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
import {GetMod} from "./CurseForgeAPIResponseTypes/GetMod";
import {GetFiles} from "./CurseForgeAPIResponseTypes/GetFiles";

const curseForgeHeaders = {
    headers: {
        'Accept': 'application/json',
        'x-api-key': curseForgeApiKey
    }
}

export const fetchJson = async (url: URL) => {
    const response = await fetch(url.toString(), curseForgeHeaders)
    return await response.json()
}

const getModFileUrl = async (param: ModSearchParam): Promise<Either<string, ModSearchParam>> => {
    if (param.directUrl != '')
        return right(param)

    const url = new URL(path.join(curseForgeApiBaseUrl, '/v1/mods', param.modid, 'files'))

    const json = await fetchJson(url) as GetFiles
    const trimmed = await trimJson(json, param)
    if (trimmed == undefined) return left(param.modid)
    param.displayName = trimmed.displayName != null ? trimmed.displayName : ''
    param.fileName = trimmed.fileName != null ? trimmed.fileName : ''

    const filePath = path.join(modsDir, param.fileName)
    const filePath2 = path.join(modsDir, param.fileName.replace(/\s+/g, '+'))
    const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)

    if (trimmed.downloadUrl == null && !fileExist) {
        console.info(`modid:${param.modid} gameversion:${param.gameVersion} ${param.displayName} doesn't have download url`)
        return left(param.modid)
    } else if (trimmed.downloadUrl == null) {
        return left('')
    } else {
        param.directUrl = trimmed.downloadUrl
        if (param.displayName === '') param.displayName = getFileName(param.directUrl)
        return right(param)
    }
}

const getModFileUrls = (params: Array<ModSearchParam>) => {
    return params.map(getModFileUrl)
}

const trimJson = async (json: GetFiles, param: ModSearchParam) => {
    const pattern = param.fileNamePattern

    const single = json.data.find((data) => data.fileName.indexOf(pattern) != -1)
    if (single === undefined)
        console.error(`${param.modid} ${param.gameVersion} ${param.fileNamePattern} not found`)
    return single
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

async function downloadModFile(param: ModSearchParam) {
    const filePath = path.join(modsDir, param.fileName)
    setupLauncherDirs()

    if (!fs.existsSync(filePath)) {
        await pipeline(
            (await fetch(param.directUrl)).body,
            createWriteStream(filePath)
        ).then(() => {
            console.log('downloaded: ' + param.fileName)
        }).catch(err => {
            console.error(err)
            console.error('failed: ' + param.fileName + ' ' + param.directUrl.toString())
        })
    }
}

export async function downloadModFiles(side: 'CLIENT' | 'SERVER' | '') {
    setupLauncherDirs()
    const jsonText = await (await fetch(namagomiModListUrl)).text()
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    const manuallyFiles = [] as string[]

    await Promise.all(urls.map(async (url: Either<string, ModSearchParam>, index) => {
        if ((params[index].side.includes(side) || params[index].side == '') && isRight(url)) {
            await downloadModFile(params[index])
        } else if(isLeft(url) && url.left !== '' ){
            manuallyFiles.push(url.left)
        }
    })).then(() => rmModFiles(params, side))

    await updateModCache()

    return await Promise.all(manuallyFiles.map(getWebsiteLink))
}

export const downloadAllModFiles = async () => {
    await downloadModFiles('')
}

export const downloadClientModFiles = async () => {
    await downloadModFiles('CLIENT')
}

export const downloadServerModFiles = async () => {
    await downloadModFiles('SERVER')
}

async function rmModFiles(params: ModSearchParam[], side: 'CLIENT' | 'SERVER' | '') {
    const files = fs.readdirSync(modsDir)

    const remoteFiles = params
        .map(param => param.directUrl)
        .filter((url, index) =>
            url != '' && (params[index].side === '' || params[index].side.includes(side)))
        .map((url) => {
            return getFileName(url)
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

async function getWebsiteLink(modid: string) {
    const response = await fetch(`https://api.curseforge.com/v1/mods/${modid}`, curseForgeHeaders)
    const json = await response.json() as GetMod
    return json.data?.links?.websiteUrl
}
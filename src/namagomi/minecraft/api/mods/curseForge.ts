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
import {GetMod} from "./JsonTypes/GetMod";
import {Data, GetFiles} from "./JsonTypes/GetFiles";
import {NamagomiCache} from "../config/namagomiConfig";
import {GetNamagomiModList} from "./JsonTypes/GetNamagomiModList";
import {isNone, none, some} from "fp-ts/Option";

const curseForgeHeaders = {
    headers: {
        'Accept': 'application/json',
        'x-api-key': curseForgeApiKey
    }
}

export async function getFiles(url: URL) {
    const response = await fetch(url.toString(), curseForgeHeaders)
    return await response.json() as GetFiles
}

async function getModFileUrl(param: ModSearchParam): Promise<Either<string, ModSearchParam>> {
    if (param.directUrl != '')
        return right(param)

    const url = new URL(path.join(curseForgeApiBaseUrl, '/v1/mods', param.modId, 'files'))

    const json = await getFiles(url)
    const trimmed = await trimJson(json, param)
    if (isNone(trimmed)) return left(param.modId)
    param.displayName = trimmed.value.displayName != null ? trimmed.value.displayName : ''
    param.fileName = trimmed.value.fileName != null ? trimmed.value.fileName : ''

    const filePath = path.join(modsDir, param.fileName)
    const filePath2 = path.join(modsDir, param.fileName.replace(/\s+/g, '+'))
    const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)

    if (trimmed.value.downloadUrl == null && !fileExist) {
        console.info(`modId:${param.modId} gameVersion:${param.gameVersion} ${param.displayName} doesn't have download url`)
        return left(param.modId)
    } else if (trimmed.value.downloadUrl == null) {
        return left('')
    } else {
        param.directUrl = trimmed.value.downloadUrl
        if (param.displayName === '') param.displayName = getFileName(param.directUrl)
        return right(param)
    }
}

function getModFileUrls(params: Array<ModSearchParam>) {
    return params.map(getModFileUrl);
}

async function trimJson(json: GetFiles, param: ModSearchParam) {
    const pattern = param.fileNamePattern

    const single = json.data.find((data:Data) => data.fileName.indexOf(pattern) != -1)
    if (single === undefined) {
        console.error(`${param.modId} ${param.gameVersion} ${param.fileNamePattern} not found`)
        return none
    }
    else return some(single)
}

async function updateModCache() {
    setupLauncherDirs()
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache, 'utf8')) as NamagomiCache

    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
    cacheJson.mods = tree.getData('mod/mod_list.json').data.sha

    fs.writeFileSync(namagomiCache, JSON.stringify(cacheJson))
}

export async function isLatestMods() {
    setupLauncherDirs()
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache, 'utf8')) as NamagomiCache

    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
    return cacheJson.mods === tree.getData('mod/mod_list.json').data.sha

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
    const jsonText = await (await fetch(namagomiModListUrl)).json() as GetNamagomiModList
    const params = jsonToModSearchParams(jsonText)
    const urls = await Promise.all(getModFileUrls(params))
    const manuallyFiles = [] as string[]

    await Promise.all(urls.map(async (url: Either<string, ModSearchParam>, index) => {
        if ((params[index].side.includes(side) || params[index].side == '') && isRight(url)) {
            await downloadModFile(params[index])
        } else if (isLeft(url) && url.left !== '') {
            manuallyFiles.push(url.left)
        }
    })).then(() => rmModFiles(params, side))

    await updateModCache()

    return Promise.all(manuallyFiles.map(getWebsiteLink))
}

export async function downloadAllModFiles() {
    return await downloadModFiles('')
}

export async function downloadClientModFiles() {
    return await downloadModFiles('CLIENT')
}

export async function downloadServerModFiles() {
    return await downloadModFiles('SERVER')
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
    if (!fs.existsSync(namagomiCache)) fs.writeFileSync(namagomiCache, JSON.stringify({data: [], mods: ''}))
    if (!fs.existsSync(namagomiIgnore)) mkEmptyNamagomiIgnore(namagomiIgnore)
}

async function getWebsiteLink(modId: string) {
    const response = await fetch(`https://api.curseforge.com/v1/mods/${modId}`, curseForgeHeaders)
    const json = await response.json() as GetMod
    return json.data?.links?.websiteUrl
}
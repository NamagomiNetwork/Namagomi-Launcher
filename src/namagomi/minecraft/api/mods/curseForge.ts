import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import path from "path"
import fetch from 'electron-fetch'
import {mainDir, minecraftDir, modsDir, namagomiCache, namagomiIgnore} from '../../../settings/localPath'
import {pipeline} from "stream/promises"
import * as fs from "fs"
import {createWriteStream} from "fs"
import {getFileName} from "../../../settings/mappings"
import {mkEmptyNamagomiIgnore, NamagomiIgnore} from "./NamagomiIgnore"
import {GitTree} from "../github/GitTree"
import {GetMod} from "./JsonTypes/GetMod"
import {GetFiles} from "./JsonTypes/GetFiles"
import {NamagomiCache} from "../data/namagomiData"
import {GetNamagomiModList, GetNamagomiMod} from "./JsonTypes/GetNamagomiModList"
import {isNone, isSome, none, some, match as matchO} from "fp-ts/Option"
import {NamagomiMod} from "./NamagomiMod"
const log = require('electron-log')

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

async function getModFileUrl(namagomiMod: GetNamagomiMod, side: string): Promise<NamagomiMod> {
    if (namagomiMod.directUrl !== null) {
        return { // directUrlがある場合
            side: namagomiMod.side,
            fileName: getFileName(namagomiMod.directUrl),
            downloadUrl: some(namagomiMod.directUrl),
            curseForge: none
        }
    }

    const getFilesUrl = new URL(path.join(curseForgeApiBaseUrl, '/v1/mods', namagomiMod.modId!, 'files'))
    if (!getFilesUrl.searchParams.has('gameVersion'))
        getFilesUrl.searchParams.append('gameVersion', namagomiMod.mcVersion)

    const gotFiles = await getFiles(getFilesUrl)
    const trimmed = await trimJson(gotFiles, namagomiMod)
    if (isNone(trimmed))
        return { // curse forgeにmodがない場合
            side: namagomiMod.side,
            fileName: '',
            downloadUrl: none,
            curseForge: none
        }

    const filePath = path.join(modsDir(side), trimmed.value.fileName)
    const filePath2 = path.join(modsDir(side), trimmed.value.fileName.replace(/\s+/g, '+'))
    const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)

    if (trimmed.value.downloadUrl == null && !fileExist && namagomiMod.modId !== null) {
        log.info(`modId:${namagomiMod.modId} gameVersion:${namagomiMod.mcVersion} ${trimmed.value.fileName} doesn't have download url`)
        return { // curse forgeにdownload urlがなく、ファイルがない場合
            side: namagomiMod.side,
            fileName: trimmed.value.fileName,
            downloadUrl: none,
            curseForge: some({
                id: namagomiMod.modId,
                gameVersion: namagomiMod.mcVersion,
                modVersion: namagomiMod.modVersion ?? '',
                hashes: trimmed.value.hashes
            })
        }
    } else if (trimmed.value.downloadUrl == null) {
        return { // curse forgeにdownload urlがなく、ファイルがある場合
            side: namagomiMod.side,
            fileName: trimmed.value.fileName,
            downloadUrl: none,
            curseForge: none
        }
    } else if(namagomiMod.modId != null) {
        namagomiMod.directUrl = trimmed.value.downloadUrl
        if (trimmed.value.fileName === '')
            trimmed.value.fileName = getFileName(namagomiMod.directUrl)
        return {
            side: namagomiMod.side,
            fileName: trimmed.value.fileName,
            downloadUrl: some(trimmed.value.downloadUrl),
            curseForge: some({
                id: namagomiMod.modId,
                gameVersion: namagomiMod.mcVersion,
                modVersion: namagomiMod.modVersion ?? '',
                hashes: trimmed.value.hashes
            })
        }
    }
    else {
        throw new Error(`unexpected json value error ${trimmed.value.fileName} side:${namagomiMod.side} downloadUrl:${trimmed.value.downloadUrl} modId:${namagomiMod.modId} modVersion:${namagomiMod.modVersion}`)
    }
}

function getModFileUrls(namagomiModList: GetNamagomiModList, side: string) {
    return namagomiModList.map((n)=>getModFileUrl(n, side))
}

async function trimJson(json: GetFiles, namagomiMod: GetNamagomiMod) {
    const pattern = namagomiMod.modVersion ?? ''

    const single = json.data.find((data) => data.fileName.indexOf(pattern) != -1)
    if (single == undefined) {
        log.error(`${namagomiMod.modId} ${namagomiMod.mcVersion} ${namagomiMod.modVersion} not found`)
        return none
    } else return some(single)
}

async function updateModCache(side: string) {
    setupLauncherDirs(side)
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache(side), 'utf8')) as NamagomiCache

    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main')
    cacheJson.mods = tree.getData('mod/mod_list.json').data.sha

    fs.writeFileSync(namagomiCache(side), JSON.stringify(cacheJson))
}

export async function isLatestMods(side: string) {
    setupLauncherDirs(side)
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache(side), 'utf8')) as NamagomiCache

    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main')
    return cacheJson.mods === tree.getData('mod/mod_list.json').data.sha

}

async function downloadModFile(namagomiMod: NamagomiMod, side: string) {
    const filePath = path.join(modsDir(side), namagomiMod.fileName)
    setupLauncherDirs(side)

    if (!fs.existsSync(filePath) && isSome(namagomiMod.downloadUrl)) {
        await pipeline(
            (await fetch(namagomiMod.downloadUrl.value)).body,
            createWriteStream(filePath)
        ).then(() => {
            log.info('downloaded: ' + namagomiMod.fileName)
        }).catch(err => {
            log.error(err)
            matchO(
                () => {
                    log.error('failed: ' + namagomiMod.fileName + ' None')
                },
                (url: string) => {
                    log.error('failed: ' + namagomiMod.fileName + ' ' + url)
                },
            )(namagomiMod.downloadUrl)
        })
    }
}

export async function downloadModFiles(side: 'CLIENT' | 'SERVER' | '') {
    setupLauncherDirs(side)
    const namagomiModList = await (await fetch(namagomiModListUrl)).json() as GetNamagomiModList
    const namagomiMods = await Promise.all(getModFileUrls(namagomiModList, side))
    const manuallyFiles = [] as string[]

    await Promise.all(
        namagomiMods.map(async (namagomiMod: NamagomiMod) => {
            matchO<string, void>(
                () => {
                    if (isSome(namagomiMod.curseForge) && namagomiMod.curseForge.value.id !== '')
                        manuallyFiles.push(namagomiMod.curseForge.value.id)
                },
                async () => {
                    if ((namagomiMod.side.includes(side) || namagomiMod.side === '')) {
                        await downloadModFile(namagomiMod, side)
                    }
                })(namagomiMod.downloadUrl)
        })).then(() => rmModFiles(namagomiMods, side))

    await updateModCache(side)

    log.info('complete: downloadModFiles')
    return Promise.all(manuallyFiles.map(getWebsiteLink))
}

function rmModFiles(namagomiMods: NamagomiMod[], side: 'CLIENT' | 'SERVER' | '') {
    const files = fs.readdirSync(modsDir(side))

    const remoteFiles = namagomiMods
        .map(namagomiMod => namagomiMod.downloadUrl)
        .filter((url, index) =>
            isSome(url) && (namagomiMods[index].side === '' || namagomiMods[index].side.includes(side)))
        .map((url) => {
            if(isSome(url)) {
                return getFileName(url.value)
            }
        })

    if (!fs.existsSync(namagomiIgnore(side))) mkEmptyNamagomiIgnore(namagomiIgnore(side))
    const ignoreFiles =
        JSON.parse(fs.readFileSync(namagomiIgnore(side), 'utf8')) as NamagomiIgnore

    files.map((file) => {
        if (!(remoteFiles.includes(file) || ignoreFiles.includes(file) || fs.statSync(path.join(modsDir(side), file)).isDirectory())) {
            fs.rmSync(path.join(modsDir(side), file))
            log.info('delete: ' + file)
        }
    })
}

function setupLauncherDirs(side: string) {
    if (!fs.existsSync(minecraftDir)) {
        fs.mkdirSync(minecraftDir)
        log.info('create: ' + minecraftDir)
    }
    if (!fs.existsSync(mainDir(side))) {
        fs.mkdirSync(mainDir(side))
        log.info('create: ' + mainDir(side))
    }
    if (!fs.existsSync(modsDir(side))) {
        fs.mkdirSync(modsDir(side))
        log.info('create: ' + modsDir(side))
    }
    if (!fs.existsSync(namagomiCache(side))) {
        fs.writeFileSync(namagomiCache(side), JSON.stringify({data: [], mods: ''}))
        log.info('create: ' + namagomiCache(side))
    }
    if (!fs.existsSync(namagomiIgnore(side))) {
        mkEmptyNamagomiIgnore(namagomiIgnore(side))
        log.info('create: ' + namagomiIgnore(side))
    }
}

async function getWebsiteLink(modId: string) {
    const response = await fetch(`https://api.curseforge.com/v1/mods/${modId}`, curseForgeHeaders)
    const json = await response.json() as GetMod
    return json.data?.links?.websiteUrl
}
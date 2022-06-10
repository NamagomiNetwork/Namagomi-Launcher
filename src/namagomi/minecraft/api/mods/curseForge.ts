import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import path from "path"
import fetch from 'electron-fetch'
import {mainDir, minecraftDir, modsDir, namagomiCache, namagomiIgnore} from '../../../settings/localPath'
import {pipeline} from "stream/promises"
import * as fs from "fs"
import {createWriteStream} from "fs"
import {getFileName} from "../../../settings/mappings"
import {NamagomiIgnore} from "./NamagomiIgnore"
import {GitTree} from "../github/GitTree"
import {GetMod} from "./JsonTypes/GetMod"
import {Data, GetFiles} from "./JsonTypes/GetFiles"
import {NamagomiCache} from "../data/namagomiData"
import {
    GetNamagomiMod,
    tryCastGetNamagomiModList
} from "./JsonTypes/GetNamagomiModList"
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
    return await response.json<GetFiles>()
}

async function getModFileUrl(namagomiMod: GetNamagomiMod, side: string): Promise<NamagomiMod> {
    if (namagomiMod.directUrl != null) {
        return {
            side: namagomiMod.side,
            fileName: getFileName(namagomiMod.directUrl),
            downloadUrl: some(namagomiMod.directUrl),
            curseForge: none
        }
    }

    if (namagomiMod.fileId == null) {
        const getFilesUrl = new URL(path.join(curseForgeApiBaseUrl, '/v1/mods', namagomiMod.modId!, 'files'))
        if (!getFilesUrl.searchParams.has('gameVersion'))
            getFilesUrl.searchParams.append('gameVersion', namagomiMod.mcVersion)
        const gotFiles = await getFiles(getFilesUrl)
        const latestFile = await trimJson(gotFiles, namagomiMod)

        if (isNone(latestFile))
            return { // curse forgeにmodがない場合
                side: namagomiMod.side,
                fileName: '',
                downloadUrl: none,
                curseForge: none
            }

        if (latestFile.value.downloadUrl == null) {
            const filePath = path.join(modsDir(side), latestFile.value.fileName)
            const filePath2 = path.join(modsDir(side), latestFile.value.fileName.replace(/\s+/g, '+'))
            const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)
            if (!fileExist)
                log.info(`modId:${namagomiMod.modId} gameVersion:${namagomiMod.mcVersion} ${latestFile.value.fileName} doesn't have download url`)

            return {
                side: namagomiMod.side,
                fileName: latestFile.value.fileName,
                downloadUrl: none,
                curseForge: some({
                    id: namagomiMod.modId!,
                    gameVersion: namagomiMod.mcVersion,
                    fileId: latestFile.value.id.toString(),
                    hashes: latestFile.value.hashes
                })
            }
        } else {
            return {
                side: namagomiMod.side,
                fileName: latestFile.value.fileName,
                downloadUrl: some(latestFile.value.downloadUrl),
                curseForge: some({
                    id: namagomiMod.modId!,
                    gameVersion: namagomiMod.mcVersion,
                    fileId: latestFile.value.id.toString(),
                    hashes: latestFile.value.hashes
                })
            }
        }
    } else {
        const getFileUrl = path.join(curseForgeApiBaseUrl, '/v1/mods', namagomiMod.modId!, 'files', namagomiMod.fileId)
        const gotFile = await (await fetch(getFileUrl)).json<Data>()

        if(gotFile.downloadUrl == null){
            const filePath = path.join(modsDir(side), gotFile.fileName)
            const filePath2 = path.join(modsDir(side), gotFile.fileName.replace(/\s+/g, '+'))
            const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)
            if (!fileExist)
                log.info(`modId:${namagomiMod.modId} gameVersion:${namagomiMod.mcVersion} ${gotFile.fileName} doesn't have download url`)

            return {
                side: namagomiMod.side,
                fileName: gotFile.fileName,
                downloadUrl: none,
                curseForge: some({
                    id: namagomiMod.modId!,
                    gameVersion: namagomiMod.mcVersion,
                    fileId: gotFile.id.toString(),
                    hashes: gotFile.hashes
                })
            }
        } else {
            return {
                side: namagomiMod.side,
                fileName: gotFile.fileName,
                downloadUrl: some(gotFile.downloadUrl),
                curseForge: some({
                    id: namagomiMod.modId!,
                    gameVersion: namagomiMod.mcVersion,
                    fileId: gotFile.id.toString(),
                    hashes: gotFile.hashes
                })
            }
        }
    }
}

async function trimJson(json: GetFiles, namagomiMod: GetNamagomiMod) {
    const pattern = namagomiMod.fileId ?? ''

    const single = json.data.find((data) => data.fileName.indexOf(pattern) != -1)
    if (single == undefined) {
        log.error(`${namagomiMod.modId} ${namagomiMod.mcVersion} ${namagomiMod.fileId} not found`)
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
    const namagomiModList = tryCastGetNamagomiModList(await (await fetch(namagomiModListUrl)).json())
    if (isSome(namagomiModList)) {
        const namagomiMods = await Promise.all(namagomiModList.value.map((n) => getModFileUrl(n, side)))
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
    else {
        return []
    }
}

function rmModFiles(namagomiMods: NamagomiMod[], side: 'CLIENT' | 'SERVER' | '') {
    const files = fs.readdirSync(modsDir(side))

    const remoteFiles = namagomiMods
        .map(namagomiMod => namagomiMod.downloadUrl)
        .filter((url, index) =>
            isSome(url) && (namagomiMods[index].side === '' || namagomiMods[index].side.includes(side)))
        .map((url) => {
            if (isSome(url)) {
                return getFileName(url.value)
            }
        })

    if (!fs.existsSync(namagomiIgnore(side))) mkfile(namagomiIgnore(side), JSON.stringify([]))
    const ignoreFiles =
        JSON.parse(fs.readFileSync(namagomiIgnore(side), 'utf8')) as NamagomiIgnore

    files.map((file) => {
        if (!(remoteFiles.includes(file) || ignoreFiles.includes(file) || fs.statSync(path.join(modsDir(side), file)).isDirectory())) {
            fs.rmSync(path.join(modsDir(side), file))
            log.info('delete: ' + file)
        }
    })
}

const mkdir = (path: string) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
        log.info('create: ' + path)
    }
}
const mkfile = (path: string, content: string) => {
    if (!fs.existsSync(namagomiCache(path))) {
        fs.writeFileSync(namagomiCache(path), content)
        log.info('create: ' + namagomiCache(path))
    }
}

function setupLauncherDirs(side: string) {
    mkdir(minecraftDir)
    mkdir(mainDir(side))
    mkdir(modsDir(side))
    mkfile(namagomiCache(side), JSON.stringify({data: [], mods: ''}))
    mkfile(namagomiIgnore(side), JSON.stringify([]))
}

async function getWebsiteLink(modId: string) {
    const response = await fetch(`https://api.curseforge.com/v1/mods/${modId}`, curseForgeHeaders)
    const json = await response.json<GetMod>()
    return json.data?.links?.websiteUrl
}
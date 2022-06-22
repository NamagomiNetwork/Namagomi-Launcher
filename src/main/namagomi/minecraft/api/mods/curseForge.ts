import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import path from 'path'
import fetch from 'electron-fetch'
import {mainDir, minecraftDir, modsDir, namagomiCache, namagomiIgnore} from '../../../settings/localPath'
import {pipeline} from 'stream/promises'
import * as fs from 'fs'
import {createWriteStream} from 'fs'
import {getFileName} from '../../../settings/mappings'
import {NamagomiIgnore} from './NamagomiIgnore'
import {GitTree} from '../github/GitTree'
import {GetMod} from './JsonTypes/GetMod'
import {Data, GetFiles} from './JsonTypes/GetFiles'
import {NamagomiCache} from '../data/namagomiData'
import {
    GetNamagomiMod,
    tryCastGetNamagomiModList
} from './JsonTypes/GetNamagomiModList'
import {isNone, isSome, none, some, match as matchO} from 'fp-ts/Option'
import {NamagomiMod} from './NamagomiMod'
import {checkSum} from './checkSum'
import {log} from '../../../Logger'

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
        const getFileUrl = `${curseForgeApiBaseUrl}/v1/mods/${namagomiMod.modId!}/files/${namagomiMod.fileId}`
        const file = await fetch(getFileUrl, curseForgeHeaders)
        const gotFile = await (file).json<{ data: Data }>()

        if (gotFile.data.downloadUrl == null) {
            const filePath = path.join(modsDir(side), gotFile.data.fileName)
            const filePath2 = path.join(modsDir(side), gotFile.data.fileName.replace(/\s+/g, '+'))
            const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)
            if (!fileExist)
                log.info(`modId:${namagomiMod.modId} gameVersion:${namagomiMod.mcVersion} ${gotFile.data.fileName} doesn't have download url`)

            return {
                side: namagomiMod.side,
                fileName: gotFile.data.fileName,
                downloadUrl: none,
                curseForge: some({
                    id: namagomiMod.modId!,
                    gameVersion: namagomiMod.mcVersion,
                    fileId: gotFile.data.id.toString(),
                    hashes: gotFile.data.hashes
                })
            }
        } else {
            return {
                side: namagomiMod.side,
                fileName: gotFile.data.fileName,
                downloadUrl: some(gotFile.data.downloadUrl),
                curseForge: some({
                    id: namagomiMod.modId!,
                    gameVersion: namagomiMod.mcVersion,
                    fileId: gotFile.data.id.toString(),
                    hashes: gotFile.data.hashes
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

export async function checkUpdate(side: 'CLIENT' | 'SERVER' | '') {
    setupLauncherDirs(side)
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache(side), 'utf8')) as NamagomiCache

    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main')
    return cacheJson.mods !== tree.getData('mod/mod_list.json').data.sha
}

async function downloadModFile(namagomiMod: NamagomiMod, side: string) {
    const filePath = path.join(modsDir(side), namagomiMod.fileName)
    setupLauncherDirs(side)

    if (!fs.existsSync(filePath) && isSome(namagomiMod.downloadUrl)) {
        const res = await fetch(namagomiMod.downloadUrl.value)
        switch (res.status) {
            case 200:
                await pipeline(res.body, createWriteStream(filePath))
                if (isSome(namagomiMod.curseForge)) {
                    const isMatch = await namagomiMod.curseForge.value.hashes.reduce(async (result, hash) => {
                        if (await result) {
                            return  isHashMatch(hash.value, hash.algo, filePath)
                        }
                        return Promise.resolve(false)
                    }, Promise.resolve(true))
                    if (!isMatch)
                        log.warn(`hash miss match: ${namagomiMod.fileName}`)
                }
                log.info('downloaded: ' + namagomiMod.fileName)
                return
            case 429:
                log.error(`file downloading error: Wait a while and try again.`)
                log.error(`\tstate: ${res.status}`)
                log.error(`\tfile name: ${namagomiMod.fileName}`)
                log.error(`\turl: ${namagomiMod.downloadUrl.value}`)
                return
            default:
                log.error(`file downloading error: unexpected error`)
                log.error(`\tstate: ${res.status}`)
                log.error(`\tfile name: ${namagomiMod.fileName}`)
                log.error(`\turl: ${namagomiMod.downloadUrl.value}`)
                return
        }
    }
}

function isHashMatch(hash: string, algorithm: number, file: string) {
    switch (algorithm) {
        case 1:
            return checkSum(file, hash, 'sha1')
        case 2:
            return checkSum(file, hash, 'md5')
        default:
            log.warn('unexpected algorithm')
            log.warn(`\thash: ${hash}`)
            log.warn(`\talgorithm: ${algorithm}`)
            log.warn(`\tfile: ${file}`)
            return Promise.resolve(false)
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
                        const filePath = path.join(modsDir(side), namagomiMod.fileName)
                        const filePath2 = path.join(modsDir(side), namagomiMod.fileName.replace(/\s+/g, '+'))
                        const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)
                        if (isSome(namagomiMod.curseForge) && namagomiMod.curseForge.value.id !== '' && !fileExist)
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
    } else {
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
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, content)
        log.info('create: ' + path)
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
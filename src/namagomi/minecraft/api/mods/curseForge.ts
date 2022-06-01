import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../../settings/config'
import path from "path";
import fetch from 'electron-fetch'
import {configDir, mainDir, minecraftDir, modsDir, namagomiCache, namagomiIgnore} from '../../../settings/localPath'
import {pipeline} from "stream/promises";
import * as fs from "fs";
import {createWriteStream} from "fs";
import {getFileName} from "../../../settings/mappings";
import {mkEmptyNamagomiIgnore, NamagomiIgnore} from "./NamagomiIgnore";
import {GitTree} from "../github/GitTree";
import {GetMod} from "./JsonTypes/GetMod";
import {GetFiles} from "./JsonTypes/GetFiles";
import {NamagomiCache} from "../config/namagomiConfig";
import {GetNamagomiModList, GetNamagomiMod} from "./JsonTypes/GetNamagomiModList";
import {isNone, isSome, none, some, match as matchO} from "fp-ts/Option";
import {NamagomiMod} from "./NamagomiMod";

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

async function getModFileUrl(namagomiMod: GetNamagomiMod): Promise<NamagomiMod> {
    if (namagomiMod.directUrl !== null) {
        return {
            side: namagomiMod.side,
            fileName: getFileName(namagomiMod.directUrl),
            downloadUrl: some(namagomiMod.directUrl),
            curseForge: none
        }
    }

    const getFilesUrl = new URL(path.join(curseForgeApiBaseUrl, '/v1/mods', namagomiMod.modId!, 'files'))
    const gotFiles = await getFiles(getFilesUrl)
    const trimmed = await trimJson(gotFiles, namagomiMod)
    if (isNone(trimmed))
        return {
            side: namagomiMod.side,
            fileName: '',
            downloadUrl: none,
            curseForge: none
        }

    const filePath = path.join(modsDir, trimmed.value.fileName)
    const filePath2 = path.join(modsDir, trimmed.value.fileName.replace(/\s+/g, '+'))
    const fileExist = fs.existsSync(filePath) || fs.existsSync(filePath2)

    if (trimmed.value.downloadUrl == null && !fileExist) {
        console.info(`modId:${namagomiMod.modId} gameVersion:${namagomiMod.mcVersion} ${trimmed.value.fileName} doesn't have download url`)
        return {
            side: namagomiMod.side,
            fileName: trimmed.value.fileName,
            downloadUrl: none,
            curseForge: some({
                id: namagomiMod.modId!,
                gameVersion: namagomiMod.mcVersion!,
                modVersion: namagomiMod.modVersion!,
                hashes: trimmed.value.hashes
            })
        }
    } else if (trimmed.value.downloadUrl == null) {
        return {
            side: namagomiMod.side,
            fileName: trimmed.value.fileName,
            downloadUrl: none,
            curseForge: none
        }
    } else {
        namagomiMod.directUrl = trimmed.value.downloadUrl
        if (trimmed.value.fileName === '')
            trimmed.value.fileName = getFileName(namagomiMod.directUrl)
        return {
            side: namagomiMod.side,
            fileName: trimmed.value.fileName,
            downloadUrl: some(trimmed.value.downloadUrl),
            curseForge: some({
                id: namagomiMod.modId!,
                gameVersion: namagomiMod.mcVersion,
                modVersion: namagomiMod.modVersion!,
                hashes: trimmed.value.hashes
            })
        }
    }
}

function getModFileUrls(namagomiModList: GetNamagomiModList) {
    return namagomiModList.map(getModFileUrl);
}

async function trimJson(json: GetFiles, namagomiMod: GetNamagomiMod) {
    const pattern = namagomiMod.modVersion ?? ''

    const single = json.data.find((data) => data.fileName.indexOf(pattern) != -1)
    if (single === undefined) {
        console.error(`${namagomiMod.modId} ${namagomiMod.mcVersion} ${namagomiMod.modVersion} not found`)
        return none
    } else return some(single)
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

async function downloadModFile(namagomiMod: NamagomiMod) {
    const filePath = path.join(modsDir, namagomiMod.fileName)
    setupLauncherDirs()

    if (!fs.existsSync(filePath) && isSome(namagomiMod.downloadUrl)) {
        await pipeline(
            (await fetch(namagomiMod.downloadUrl.value)).body,
            createWriteStream(filePath)
        ).then(() => {
            console.log('downloaded: ' + namagomiMod.fileName)
        }).catch(err => {
            console.error(err)
            matchO(
                () => {
                    console.error('failed: ' + namagomiMod.fileName + ' None')
                },
                (url: string) => {
                    console.error('failed: ' + namagomiMod.fileName + ' ' + url)
                },
            )(namagomiMod.downloadUrl)
        })
    }
}

export async function downloadModFiles(side: 'CLIENT' | 'SERVER' | '') {
    setupLauncherDirs()
    const namagomiModList = await (await fetch(namagomiModListUrl)).json() as GetNamagomiModList
    const namagomiMods = await Promise.all(getModFileUrls(namagomiModList))
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
                        await downloadModFile(namagomiMod)
                    }
                })(namagomiMod.downloadUrl)
        })).then(() => rmModFiles(namagomiMods, side))

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

async function rmModFiles(namagomiMods: NamagomiMod[], side: 'CLIENT' | 'SERVER' | '') {
    const files = fs.readdirSync(modsDir)

    const remoteFiles = namagomiMods
        .map(namagomiMod => namagomiMod.downloadUrl)
        .filter((url, index) =>
            isSome(url) && (namagomiMods[index].side === '' || namagomiMods[index].side.includes(side)))
        .map((url) => {
            if(isSome(url)) {
                return getFileName(url.value)
            }
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
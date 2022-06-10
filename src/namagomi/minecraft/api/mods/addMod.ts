import {modsDir, namagomiIgnore} from "../../../settings/localPath"
import fs from "fs"
import {NamagomiIgnore} from "./NamagomiIgnore"
import path from "path"
const log = require('electron-log')

export function addMods(paths: string[], names: string[], side: string) {
    const namagomiIgnoreJson = getIgnoreList(side)

    paths
        .map((pPath, index)=> {
            if(!namagomiIgnoreJson.includes(names[index]))
                namagomiIgnoreJson.push(names[index])
            fs.copyFileSync(pPath, path.join(modsDir(side), names[index]))
            log.info('copied: ' + names[index])
        })

    fs.writeFileSync(namagomiIgnore(side), JSON.stringify(namagomiIgnoreJson))
    return names
}

function mkEmptyJson(path: string) {
    fs.writeFileSync(path, JSON.stringify([]))
    log.info('create: ' + path)
}

export function getIgnoreList(side: string) {
    if(!fs.existsSync(namagomiIgnore(side))) mkEmptyJson(namagomiIgnore(side))
    return JSON.parse(fs.readFileSync(namagomiIgnore(side)).toString()) as NamagomiIgnore
}

export function removeMods(mods: string[], side: string) {
    const ignoreFiles = getIgnoreList(side)
    const newIgnore = ignoreFiles.filter(ignore => !mods.includes(ignore))
    fs.writeFileSync(namagomiIgnore(side), JSON.stringify(newIgnore))
    mods.map(mod => {
        fs.rmSync(path.join(modsDir(side), mod))
        log.info(`delete: ${mod}`)
    })
}
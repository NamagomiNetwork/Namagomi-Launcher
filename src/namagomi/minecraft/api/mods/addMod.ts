import {modsDir, namagomiIgnore} from "../../../settings/localPath";
import fs from "fs";
import {NamagomiIgnore} from "./NamagomiIgnore";
import path from "path";

export function addMods(paths: string[], names: string[]) {
    if(!fs.existsSync(namagomiIgnore)) mkEmptyJson(namagomiIgnore)
    const namagomiIgnoreJson = JSON.parse(fs.readFileSync(namagomiIgnore).toString()) as NamagomiIgnore

    paths
        .map((pPath, index)=> {
            if(!namagomiIgnoreJson.includes(names[index]))
                namagomiIgnoreJson.push(names[index])
            fs.copyFileSync(pPath, path.join(modsDir, names[index]))
        })

    fs.writeFileSync(namagomiIgnore, JSON.stringify(namagomiIgnoreJson))
    return names
}

function mkEmptyJson(path: string) {
    fs.writeFileSync(path, JSON.stringify([]))
}

export function getIgnoreList() {
    if(!fs.existsSync(namagomiIgnore)) mkEmptyJson(namagomiIgnore)
    return JSON.parse(fs.readFileSync(namagomiIgnore).toString()) as NamagomiIgnore
}

export function removeMods(names: string[]) {

}
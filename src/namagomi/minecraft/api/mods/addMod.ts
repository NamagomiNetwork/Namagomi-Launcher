import {modsDir, namagomiIgnore} from "../../../settings/localPath";
import fs from "fs";
import {NamagomiIgnore} from "./NamagomiIgnore";
import path from "path";

export function addMods(mod: FileList) {
    if(!fs.existsSync(namagomiIgnore)) mkEmptyJson(namagomiIgnore)
    const namagomiIgnoreJson = JSON.parse(fs.readFileSync(namagomiIgnore).toString()) as NamagomiIgnore

    Array.from(mod)
        .map(file => {
            namagomiIgnoreJson.push(file.name)
            fs.copyFileSync(file.path, path.join(modsDir, file.name))
        })

    fs.writeFileSync(namagomiIgnore, JSON.stringify(namagomiIgnoreJson))
}

function mkEmptyJson(path: string) {
    fs.writeFileSync(path, JSON.stringify([]))
}
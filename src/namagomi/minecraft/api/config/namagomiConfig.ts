import {GitTree} from "../github/GitTree";
import fs, {createWriteStream} from "fs";
import {devConfigDir, devNamagomiCache} from "../../../settings/localPath";
import {pipeline} from "stream/promises";
import fetch from "electron-fetch";
import {namagomiFileUrlBase} from "../../../settings/config";
import path from "path";

export async function devDownloadAllConfigFile() {
    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
    const configSha = (await tree.getData('config')).data.sha;
    const configTree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', configSha);
    const configPaths = await configTree.getAllFilePaths()
    const configSubDirs = await configTree.getAllDirectoryPaths()

    if(!fs.existsSync(devNamagomiCache)) createEmptyJson(devNamagomiCache)
    const cacheJson = JSON.parse(fs.readFileSync(devNamagomiCache, 'utf8'))

    await Promise.all(configPaths.map(async cfgPath => {
        const fileName = cfgPath.split('/').pop()!
        if (!fs.existsSync(devConfigDir)) fs.mkdirSync(devConfigDir)
        configSubDirs.map(async (dir) => {
            const absDir = path.join(devConfigDir, dir)
            if (!fs.existsSync(absDir)) fs.mkdirSync(absDir)
        })

        const sha = (await configTree.getData(cfgPath)).data.sha
        if(!(fileName in cacheJson)) cacheJson[fileName] = ""
        if(cacheJson[fileName] !== sha) {
            const filePath = path.join(devConfigDir, cfgPath)
            console.log(`downloading ${fileName}`)

            await pipeline(
                (await fetch(namagomiFileUrlBase(cfgPath))).body,
                createWriteStream(filePath)
            ).then(() => {
                console.log('[COMPLETE] ' + fileName)
                cacheJson[fileName] = sha
            }).catch(err => {
                console.error(err)
                console.log('[FAILED] ' + fileName + ' ' + namagomiFileUrlBase(cfgPath).toString())
            })
        } else {
            console.log(`[IGNORE] ${fileName}`)
        }
    }))
    fs.writeFileSync(devNamagomiCache, JSON.stringify(cacheJson))
}

function createEmptyJson(path:string) {
    fs.writeFileSync(path, JSON.stringify({}))
}
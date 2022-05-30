import {GitTree} from "../github/GitTree";
import fs, {createWriteStream} from "fs";
import {pipeline} from "stream/promises";
import fetch from "electron-fetch";
import {namagomiConfigFileUrlBase, namagomiFileUrlBase} from "../../../settings/config";
import path from "path";
import {configDir, namagomiCache} from "../../../settings/localPath";

export async function downloadAllConfigFiles() {
    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
    const configSha = (await tree.getData('config')).data.sha;
    const configTree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', configSha);
    const configPaths = await configTree.getAllFilePaths()
    const configSubDirs = await configTree.getAllDirectoryPaths()

    if(!fs.existsSync(namagomiCache)) createEmptyJson(namagomiCache)
    const cacheJson = JSON.parse(fs.readFileSync(namagomiCache, 'utf8'))

    await Promise.all(configPaths.map(async cfgPath => {
        const fileName = cfgPath.split('/').pop()!
        if (!fs.existsSync(configDir)) fs.mkdirSync(configDir)
        configSubDirs.map(async (dir) => {
            const absDir = path.join(configDir, dir)
            if (!fs.existsSync(absDir)) fs.mkdirSync(absDir)
        })

        const sha = (await configTree.getData(cfgPath)).data.sha
        if(!(fileName in cacheJson)) cacheJson[fileName] = ""
        if(cacheJson[fileName] !== sha) {
            const filePath = path.join(configDir, cfgPath)

            const fileContent = await fetch(namagomiConfigFileUrlBase(cfgPath))
            switch (fileContent.status) {
                case 200:
                    await pipeline(await fileContent.text(),
                        createWriteStream(filePath))
                        .then(() => {
                            console.log('downloaded: ' + fileName)
                            cacheJson[fileName] = sha
                        }).catch(err => {
                            console.error(err)
                            console.log('failed: ' + fileName + ' ' + namagomiFileUrlBase(cfgPath).toString())
                        })
                    break;
                default:
                    console.error('failed: ' + fileName + ' ' + namagomiFileUrlBase(cfgPath).toString())
                    console.error(`status: ${fileContent.status}`)
            }
        }
    }))
    fs.writeFileSync(namagomiCache, JSON.stringify(cacheJson))
}

function createEmptyJson(path:string) {
    fs.writeFileSync(path, JSON.stringify({}))
}
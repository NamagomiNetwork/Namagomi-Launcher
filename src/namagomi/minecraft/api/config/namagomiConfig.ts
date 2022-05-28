import {GitTree} from "../github/GitTree";
import fs, {createWriteStream} from "fs";
import {devConfigDir} from "../../../settings/localPath";
import {pipeline} from "stream/promises";
import fetch from "electron-fetch";
import {namagomiFileUrlBase} from "../../../settings/config";
import path from "path";

export async function devDownloadAllConfigFile() {
    const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main');
    const configSha = (await tree.getData('config')).data.sha;
    const configTree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', configSha);
    const configPaths = await configTree.getAllFilePaths()
    configPaths.map(async cfgPath => {
        const fileName = cfgPath.split('/').pop()!
        if (!fs.existsSync(devConfigDir)) fs.mkdirSync(devConfigDir)

        const sha = (await configTree.getData(cfgPath)).data.sha
        const filePath = path.join(devConfigDir, cfgPath)
        console.log(`downloading ${fileName}`)

        pipeline(
            (await fetch(namagomiFileUrlBase(cfgPath))).body,
            createWriteStream(filePath)
        ).then(() => {
            console.log('[COMPLETE] ' + fileName)
        }).catch(err => {
            console.error(err)
            console.log('[FAILED] ' + fileName + ' ' + namagomiFileUrlBase(cfgPath).toString())
        })
    })
}
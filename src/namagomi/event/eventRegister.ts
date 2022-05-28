import {ipcMain} from "electron";
import {setup} from "../minecraft/launcher/setupNamagomiLauncherProfile";
import {
    downloadAllModFiles,
    downloadClientModFiles,
    DownloadModFilesDev,
    downloadServerModFiles
} from "../minecraft/api/mods/curse_forge";
import {GitTree} from '../minecraft/api/github/GitTree';

export function eventHandlerRegistry () {
    ipcMain.handle('setupNamagomiLauncherProfile', async () => {
        setup()
    })

    ipcMain.handle('downloadAllModFiles', async () => {
        await downloadAllModFiles()
    })

    ipcMain.handle('downloadClientModFiles', async () => {
        await downloadClientModFiles()
    })

    ipcMain.handle('downloadServerModFiles', async () => {
        await downloadServerModFiles()
    })

    ipcMain.handle('downloadModFilesDev', async () => {
        await DownloadModFilesDev()
    })

    ipcMain.handle('BuildGitTree', async () => {
        new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main')
            .then(tree => {
                tree.getAllPaths().then(paths => {
                    paths.map(path => {
                        console.log(path)
                    })
                })
            })
    })

    ipcMain.on('GetGitFileData', async (event, arg) => {
        const tree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', 'main')
        const data = await tree.getData(arg)
        console.log(`path: ${data.data.path}`)
        console.log(`type: ${data.data.type}`)
        console.log(`sha: ${data.data.sha}`)
        console.log(`url: ${data.data.url}`)
    })
}
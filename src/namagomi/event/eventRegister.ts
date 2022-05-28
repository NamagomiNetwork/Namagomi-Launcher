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
        const configTree = await new GitTree().build('NamagomiNetwork', 'Namagomi-mod', (await tree.getData('config')).data.sha)
        configTree.getAllPaths().then(paths => {
            paths.map(path => {
                console.log(path)
            })
        })
    })
}
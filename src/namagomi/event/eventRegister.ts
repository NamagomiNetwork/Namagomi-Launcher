import {ipcMain, shell} from "electron";
import {setup} from "../minecraft/launcher/setupNamagomiLauncherProfile";
import {
    downloadAllModFiles,
    downloadClientModFiles,
    downloadServerModFiles, isLatestMods
} from "../minecraft/api/mods/curseForge";
import {GitTree} from '../minecraft/api/github/GitTree';
import {downloadAllConfigFiles} from "../minecraft/api/config/namagomiConfig";
import {mainDir} from "../settings/localPath";
import {addMods, getIgnoreList, removeMods} from "../minecraft/api/mods/addMod";

export function eventHandlerRegistry () {
    ipcMain.handle('setupNamagomiLauncherProfile', async () => {
        setup()
    })

    ipcMain.handle('downloadAllModFiles', () => {
        return downloadAllModFiles()
    })

    ipcMain.handle('downloadClientModFiles', () => {
        return downloadClientModFiles()
    })

    ipcMain.handle('downloadServerModFiles', () => {
        return downloadServerModFiles()
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

    ipcMain.handle('downloadAllConfigFiles', async () => {
        await downloadAllConfigFiles()
    })

    ipcMain.handle('OpenFolder', async () => {
        await shell.openPath(mainDir)
    })

    ipcMain.handle('addMods', (event, paths:string[], names:string[]) => {
        addMods(paths, names)
    })

    ipcMain.handle('getIgnoreList', () => {
        return getIgnoreList()
    })

    ipcMain.handle('removeMods', (event, mods:string[]) => {
        removeMods(mods)
    })

    ipcMain.handle('isLatestMods', async () => {
        return await isLatestMods()
    })
}
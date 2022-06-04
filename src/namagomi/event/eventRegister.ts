import {ipcMain, shell} from "electron";
import {setup} from "../minecraft/launcher/setupNamagomiLauncherProfile";
import {
    downloadAllModFiles,
    downloadClientModFiles,
    downloadServerModFiles, isLatestMods
} from "../minecraft/api/mods/curseForge";
import {downloadAllDataFiles} from "../minecraft/api/data/namagomiData";
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

    ipcMain.handle('downloadAllConfigFiles', async () => {
        await downloadAllDataFiles('main')
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
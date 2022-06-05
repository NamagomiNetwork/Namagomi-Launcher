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
    ipcMain.handle('setupNamagomiLauncherProfile', async (e, side: string) => {
        setup(side)
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

    ipcMain.handle('downloadAllConfigFiles', async (e, side: string) => {
        await downloadAllDataFiles('main', side)
    })

    ipcMain.handle('OpenFolder', async (e, side: string) => {
        await shell.openPath(mainDir(side))
    })

    ipcMain.handle('addMods', (event, paths:string[], names:string[]) => {
        addMods(paths, names, 'CLIENT')
    })

    ipcMain.handle('getIgnoreList', () => {
        return getIgnoreList('CLIENT')
    })

    ipcMain.handle('removeMods', (event, mods:string[]) => {
        removeMods(mods, 'CLIENT')
    })

    ipcMain.handle('isLatestMods', async (e, side: string) => {
        return await isLatestMods(side)
    })
}
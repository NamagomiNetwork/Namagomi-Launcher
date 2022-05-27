import {ipcMain} from "electron";
import {setup} from "../minecraft/launcher/setupNamagomiLauncherProfile";
import {
    downloadAllModFiles,
    downloadClientModFiles,
    DownloadModFilesDev,
    downloadServerModFiles
} from "../minecraft/api/curse_forge";

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
}
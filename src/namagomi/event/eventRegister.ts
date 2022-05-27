import {ipcMain} from "electron";
import {setup} from "../minecraft/launcher/setupNamagomiLauncherProfile";
import {downloadAllModFiles, DownloadModFilesDev} from "../minecraft/api/curse_forge";

export function eventHandlerRegistry () {
    ipcMain.handle('setupNamagomiLauncherProfile', async () => {
        setup()
    })

    ipcMain.handle('downloadAllModFiles', async () => {
        await downloadAllModFiles()
    })

    ipcMain.handle('sampleDownloadModFilesDev', async () => {
        await DownloadModFilesDev()
    })
}
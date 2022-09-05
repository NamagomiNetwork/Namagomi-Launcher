import {ipcMain, shell} from 'electron'
import {setup} from '../minecraft/launcher/setupNamagomiLauncherProfile'
import {
    downloadModFiles, checkUpdate
} from '../minecraft/api/mods/curseForge'
import {downloadAllDataFiles} from '../minecraft/api/data/namagomiData'
import {mainDir} from '../settings/localPath'
import {addMods, getIgnoreList, removeMods} from '../minecraft/api/mods/addMod'
import {openLogsFolder} from './logs'
import {BrowserWindow} from 'electron'

export function mainApiRegistry(mainWindow: BrowserWindow) {
    ipcMain.on('setupNamagomiLauncherProfile', (e, side: 'CLIENT' | 'SERVER' | '') => {
        setup(side)
    })

    ipcMain.handle('downloadModFiles', async (e, side: 'CLIENT' | 'SERVER' | '') => {
        return downloadModFiles(side)
    })

    ipcMain.on('downloadAllConfigFiles', async (e, side: string) => {
        await downloadAllDataFiles('main', side)
    })

    ipcMain.on('OpenFolder', async (e, side: string) => {
        await shell.openPath(mainDir(side))
    })

    ipcMain.on('addMods', (event, paths: string[], names: string[], side: string) => {
        addMods(paths, names, side)
    })

    ipcMain.handle('getIgnoreList', (e, side: string) => {
        return getIgnoreList(side)
    })

    ipcMain.on('removeMods', (event, mods: string[], side: string) => {
        removeMods(mods, side)
    })

    ipcMain.on('openLogsFolder', openLogsFolder)

    ipcMain.on('checkUpdate', async (e, side: 'CLIENT' | 'SERVER' | '') => {
        mainWindow.webContents.send('checkUpdateBack', await checkUpdate(side))
    })
}
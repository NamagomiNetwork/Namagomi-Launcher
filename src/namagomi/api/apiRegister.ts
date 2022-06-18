import {ipcMain, shell} from 'electron'
import {setup} from '../minecraft/launcher/setupNamagomiLauncherProfile'
import {
    downloadModFiles, isLatestMods
} from '../minecraft/api/mods/curseForge'
import {downloadAllDataFiles} from '../minecraft/api/data/namagomiData'
import {mainDir} from '../settings/localPath'
import {addMods, getIgnoreList, removeMods} from '../minecraft/api/mods/addMod'
import {openLogsFolder} from './logs'

export function apiRegistry() {
    ipcMain.handle('setupNamagomiLauncherProfile', async (e, side: string) => {
        setup(side)
    })

    ipcMain.handle('downloadModFiles', async (e, side: 'CLIENT' | 'SERVER' | '') => {
        return downloadModFiles(side)
    })

    ipcMain.handle('downloadAllConfigFiles', async (e, side: string) => {
        await downloadAllDataFiles('main', side)
    })

    ipcMain.handle('OpenFolder', async (e, side: string) => {
        await shell.openPath(mainDir(side))
    })

    ipcMain.handle('addMods', (event, paths: string[], names: string[], side: string) => {
        addMods(paths, names, side)
    })

    ipcMain.handle('getIgnoreList', (e, side: string) => {
        return getIgnoreList(side)
    })

    ipcMain.handle('removeMods', (event, mods: string[], side: string) => {
        removeMods(mods, side)
    })

    ipcMain.handle('isLatestMods', async (e, side: 'CLIENT' | 'SERVER' | '') => {
        return await isLatestMods(side)
    })

    ipcMain.handle('openLogsFolder', openLogsFolder)
}
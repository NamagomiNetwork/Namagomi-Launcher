import {contextBridge, ipcRenderer} from 'electron'
import IpcRendererEvent = Electron.IpcRendererEvent

contextBridge.exposeInMainWorld('namagomiAPI', {
    downloadModFiles: (side: string) => ipcRenderer.invoke('downloadModFiles', side),
    downloadAllConfigFiles: (side: string) => ipcRenderer.send('downloadAllConfigFiles', side),
    setupNamagomiLauncherProfile: (side: string) => ipcRenderer.send('setupNamagomiLauncherProfile', side),
    OpenFolder: (side: string) => ipcRenderer.send('OpenFolder', side),
    addMods: (paths: string[], names: string[], side: string) => ipcRenderer.send('addMods', paths, names, side),
    getIgnoreList: (side: string) => ipcRenderer.invoke('getIgnoreList', side),
    removeMods: (mods: string[], side: string) => ipcRenderer.send('removeMods', mods, side),
    isLatestMods: (side: string) => ipcRenderer.invoke('isLatestMods', side),
    openLogsFolder: () => ipcRenderer.send('openLogsFolder'),
    log: (callback: (event: IpcRendererEvent, level: string, contents: string) => void) => ipcRenderer.on('log', callback)
})
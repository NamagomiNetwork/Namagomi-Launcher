import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('namagomiAPI', {
    downloadModFiles: (side: string) => ipcRenderer.invoke('downloadModFiles', side),
    downloadAllModFiles: () => ipcRenderer.invoke('downloadAllModFiles'),
    downloadClientModFiles: () => ipcRenderer.invoke('downloadClientModFiles'),
    downloadServerModFiles: () => ipcRenderer.invoke('downloadServerModFiles'),
    downloadAllConfigFiles: (side: string) => ipcRenderer.invoke('downloadAllConfigFiles', side),
    setupNamagomiLauncherProfile: (side: string) => ipcRenderer.invoke('setupNamagomiLauncherProfile', side),
    OpenFolder: (side: string) => ipcRenderer.invoke('OpenFolder', side),
    addMods: (paths:string[], names:string[], side: string) => ipcRenderer.invoke('addMods', paths, names, side),
    getIgnoreList: (side: string) => ipcRenderer.invoke('getIgnoreList', side),
    removeMods: (mods:string[], side: string) => ipcRenderer.invoke('removeMods', mods, side),
    isLatestMods: (side: string) => ipcRenderer.invoke('isLatestMods', side)
})
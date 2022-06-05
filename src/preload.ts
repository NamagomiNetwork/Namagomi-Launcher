import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('namagomiAPI', {
    downloadAllModFiles: () => ipcRenderer.invoke('downloadAllModFiles'),
    downloadClientModFiles: () => ipcRenderer.invoke('downloadClientModFiles'),
    downloadServerModFiles: () => ipcRenderer.invoke('downloadServerModFiles'),
    downloadAllConfigFiles: (side: string) => ipcRenderer.invoke('downloadAllConfigFiles', side),
    setupNamagomiLauncherProfile: (side: string) => ipcRenderer.invoke('setupNamagomiLauncherProfile', side),
    OpenFolder: (side: string) => ipcRenderer.invoke('OpenFolder', side),
    addMods: (paths:string[], names:string[]) => ipcRenderer.invoke('addMods', paths, names),
    getIgnoreList: () => ipcRenderer.invoke('getIgnoreList'),
    removeMods: (mods:string[]) => ipcRenderer.invoke('removeMods', mods),
    isLatestMods: (side: string) => ipcRenderer.invoke('isLatestMods', side)
})
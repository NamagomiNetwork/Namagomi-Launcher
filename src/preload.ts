import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('namagomiAPI', {
    downloadAllModFiles: () => ipcRenderer.invoke('downloadAllModFiles'),
    downloadClientModFiles: () => ipcRenderer.invoke('downloadClientModFiles'),
    downloadServerModFiles: () => ipcRenderer.invoke('downloadServerModFiles'),
    downloadAllConfigFiles: () => ipcRenderer.invoke('downloadAllConfigFiles'),
    setupNamagomiLauncherProfile: () => ipcRenderer.invoke('setupNamagomiLauncherProfile'),
    downloadModFilesDev: () => ipcRenderer.invoke('downloadModFilesDev'),
    BuildGitTree: () => ipcRenderer.invoke('BuildGitTree'),
    GetGitFileData: (path: string) => ipcRenderer.send('GetGitFileData', path),
    OpenFolder: () => ipcRenderer.invoke('OpenFolder'),
    addMods: (paths:string[], names:string[]) => ipcRenderer.invoke('addMods', paths, names)
})
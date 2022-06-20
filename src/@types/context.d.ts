import IpcRendererEvent = Electron.IpcRendererEvent

export interface IElectronAPI {
    downloadModFiles: (side: string) => Promise<string[]>
    downloadAllConfigFiles: (side: string) => Promise<void>
    setupNamagomiLauncherProfile: (side: string) => void
    OpenFolder: (side: string) => Promise<void>
    addMods: (paths: string[], names: string[], side: string) => void
    getIgnoreList: (side: string) => Promise<string[]>
    removeMods: (mods: string[], side: string) => void
    openLogsFolder: () => Promise<void>
    checkUpdate: (side: string) => Promise<void>
    log: (f: (event: IpcRendererEvent, level: string, contents: string) => void) => void
    checkUpdateBack: (f: (event: IpcRendererEvent, updatable: boolean) => void) => void
}

declare global {
    interface Window {
        namagomiAPI: IElectronAPI
    }
}

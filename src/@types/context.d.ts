export interface IElectronAPI {
    downloadAllModFiles: () => Promise<string[]>;
    downloadClientModFiles: () => Promise<string[]>;
    downloadServerModFiles: () => Promise<string[]>;
    downloadAllConfigFiles: (side: string) => Promise<void>;
    setupNamagomiLauncherProfile: (side: string) => Promise<void>;
    downloadModFilesDev: () => Promise<void>;
    OpenFolder: (side: string) => Promise<void>;
    addMods: (paths:string[], names:string[], side: string) => Promise<void>;
    getIgnoreList: (side: string) => Promise<string[]>;
    removeMods: (mods:string[], side: string) => Promise<void>;
    isLatestMods: (side: 'CLIENT' | 'SERVER' | '') => Promise<boolean>;
}

declare global {
  interface Window {
    namagomiAPI: IElectronAPI
  }
}

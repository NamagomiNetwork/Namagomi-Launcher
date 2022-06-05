export interface IElectronAPI {
    downloadAllModFiles: () => Promise<string[]>;
    downloadClientModFiles: () => Promise<string[]>;
    downloadServerModFiles: () => Promise<string[]>;
    downloadAllConfigFiles: (side: string) => Promise<void>;
    setupNamagomiLauncherProfile: (side: string) => Promise<void>;
    downloadModFilesDev: () => Promise<void>;
    OpenFolder: (side: string) => Promise<void>;
    addMods: (paths:string[], names:string[]) => Promise<void>;
    getIgnoreList: () => Promise<string[]>;
    removeMods: (mods:string[]) => Promise<void>;
    isLatestMods: (side: string) => Promise<boolean>;
}

declare global {
  interface Window {
    namagomiAPI: IElectronAPI
  }
}

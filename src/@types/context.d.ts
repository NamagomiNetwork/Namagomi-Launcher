export interface IElectronAPI {
    downloadAllModFiles: () => Promise<void>;
    downloadClientModFiles: () => Promise<void>;
    downloadServerModFiles: () => Promise<void>;
    downloadAllConfigFiles: () => Promise<void>;
    setupNamagomiLauncherProfile: () => Promise<void>;
    downloadModFilesDev: () => Promise<void>;
    BuildGitTree: () => Promise<void>;
    GetGitFileData: (path: string) => Promise<void>;
    OpenFolder: () => Promise<void>;
    addMods: (paths:string[], names:string[]) => Promise<void>;
    getIgnoreList: () => Promise<string[]>;
    removeMods: (mods:string[]) => Promise<void>;
    isLatestMods: () => Promise<boolean>;
}

declare global {
  interface Window {
    namagomiAPI: IElectronAPI
  }
}

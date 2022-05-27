export interface IElectronAPI {
  downloadAllModFiles: () => Promise<void>;
  downloadClientModFiles: () => Promise<void>;
  downloadServerModFiles: () => Promise<void>;
  setupNamagomiLauncherProfile: () => Promise<void>;
  downloadModFilesDev: () => Promise<void>;
}

declare global {
  interface Window {
    namagomiAPI: IElectronAPI
  }
}

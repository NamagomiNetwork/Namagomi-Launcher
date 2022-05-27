export interface IElectronAPI {
  downloadAllModFiles: () => Promise<void>;
  setupNamagomiLauncherProfile: () => Promise<void>;
    sampleDownloadModFilesDev: () => Promise<void>;
}

declare global {
  interface Window {
    namagomiAPI: IElectronAPI
  }
}

export interface IElectronAPI {
  downloadAllModFiles: () => Promise<void>;
  setupNamagomiLauncherProfile: () => Promise<void>;
    sampleDownloadModFiles: () => Promise<void>;
}

declare global {
  interface Window {
    namagomiAPI: IElectronAPI
  }
}

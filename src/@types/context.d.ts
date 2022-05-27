export interface IElectronAPI {
  downloadAllModFiles: () => Promise<void>;
}

declare global {
  interface Window {
    namagomiAPI: IElectronAPI
  }
}

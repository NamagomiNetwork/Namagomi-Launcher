import { contextBridge, ipcRenderer } from 'electron';
import {downloadAllModFiles} from "./namagomi/minecraft/api/curse_forge";

contextBridge.exposeInMainWorld('namagomiAPI', {
  downloadAllModFiles: () => ipcRenderer.invoke('downloadAllModFiles'),
  downloadClientModFiles: () => ipcRenderer.invoke('downloadClientModFiles'),
  downloadServerModFiles: () => ipcRenderer.invoke('downloadServerModFiles'),
  setupNamagomiLauncherProfile: () => ipcRenderer.invoke('setupNamagomiLauncherProfile'),
  sampleDownloadModFilesDev: () => ipcRenderer.invoke('sampleDownloadModFilesDev'),
})
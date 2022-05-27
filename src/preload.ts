import { contextBridge, ipcRenderer } from 'electron';
import {downloadAllModFiles} from "./namagomi/minecraft/api/curse_forge";

contextBridge.exposeInMainWorld('namagomiAPI', {
  downloadAllModFiles: () => ipcRenderer.invoke('downloadAllModFiles'),
})
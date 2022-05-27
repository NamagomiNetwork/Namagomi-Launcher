import { contextBridge, ipcRenderer } from 'electron';
import {downloadAllModFiles} from "./namagomi/minecraft/api/curse_forge";

contextBridge.exposeInMainWorld('myAPI', {
  update: (count: number) => ipcRenderer.send('update-title', count),
});

contextBridge.exposeInMainWorld('namagomiAPI', {
  downloadAllModFiles: () => downloadAllModFiles()
})
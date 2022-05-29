import {app} from 'electron';
import path from "path";

export const userDir = app.getPath('userData')
export const minecraftDir = path.join(userDir, 'minecraft')
export const mainDir = path.join(minecraftDir, 'main')
export const modsDir = path.join(mainDir, 'mods')
export const configDir = path.join(mainDir, 'config')
export const namagomiCache = path.join(mainDir, '.namagomi-cache')
export const namagomiIgnore = path.join(mainDir, '.namagomi-ignore')
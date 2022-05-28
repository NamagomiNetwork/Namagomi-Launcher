import {app} from 'electron';
import path from "path";

export const userDir = app.getPath('userData')
export const minecraftDir = path.join(userDir, 'minecraft')
export const devDir = path.join(minecraftDir, 'dev')
export const mainDir = path.join(minecraftDir, 'main')
export const devModsDir = path.join(devDir, 'mods')
export const ModsDir = path.join(mainDir, 'mods')
export const devConfigDir = path.join(devDir, 'config')
export const ConfigDir = path.join(mainDir, 'config')
export const devNamagomiCache = path.join(devDir, '.namagomi-cache')
export const namagomiCache = path.join(mainDir, '.namagomi-cache')
export const devNamagomiIgnore = path.join(devDir, '.namagomi-ignore')
export const namagomiIgnore = path.join(mainDir, '.namagomi-ignore')
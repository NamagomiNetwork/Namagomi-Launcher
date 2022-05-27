import {app} from 'electron';
import path from "path";

export const userDir = app.getPath('userData')
export const minecraftDir = path.join(userDir, 'minecraft')
export const devDir = path.join(minecraftDir, 'dev')
export const mainDir = path.join(userDir, 'main')
export const devModsDir = path.join(devDir, 'mods')
export const ModsDir = path.join(mainDir, 'mods')
export const devConfigDir = path.join(devDir, 'config')
export const ConfigDir = path.join(mainDir, 'config')
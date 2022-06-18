import {app} from 'electron'
import path from 'path'

export const userDir = app.getPath('userData')
export const minecraftDir = path.join(userDir, 'minecraft')
export const mainDir = (side: string) => path.join(minecraftDir, `main-${side}`)
export const modsDir = (side: string) => path.join(mainDir(side), 'mods')
export const namagomiCache = (side: string) => path.join(mainDir(side), '.namagomi-cache')
export const namagomiIgnore = (side: string) => path.join(mainDir(side), '.namagomi-ignore')
export const logsDir = path.join(userDir, 'logs')
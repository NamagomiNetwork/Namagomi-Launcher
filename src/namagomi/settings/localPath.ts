import {app} from 'electron';
import path from "path";

const userDir = app.getPath('userData')
const minecraftDir = path.join(userDir, 'minecraft')
const devDir = path.join(minecraftDir, 'dev')
const mainDir = path.join(userDir, 'main')
const devModsDir = path.join(devDir, 'mods')
const ModsDir = path.join(mainDir, 'mods')
const devConfigDir = path.join(devDir, 'config')
const ConfigDir = path.join(mainDir, 'config')
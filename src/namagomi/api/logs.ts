import {shell} from 'electron'
import {logsDir} from '../settings/localPath'
import fs from 'fs'

const log = require('electron-log')

export async function openLogsFolder() {
    if (!fs.existsSync(logsDir)) {
        log.error(`${logsDir} not found`)
    }
    await shell.openPath(logsDir)
}
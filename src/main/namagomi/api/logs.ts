import {shell} from 'electron'
import {logsDir} from '../settings/localPath'
import fs from 'fs'
import {log} from '../../../generic/Logger'

export async function openLogsFolder() {
    if (!fs.existsSync(logsDir)) {
        log.error(`${logsDir} not found`)
    }
    await shell.openPath(logsDir)
}
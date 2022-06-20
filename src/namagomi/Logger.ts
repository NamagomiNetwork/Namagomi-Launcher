import BrowserWindow = Electron.BrowserWindow

const electronLog = require('electron-log')

export class log {
    public static mainWindow: BrowserWindow
    static send = (level: string, contents: string) => log.mainWindow.webContents.send('log', level, contents)

    public static info(params: string) {
        electronLog.info(params)
        log.send('INFO', params)
    }

    public static warn(params: string) {
        electronLog.warn(params)
        log.send('WARN', params)
    }

    public static error(params: string) {
        electronLog.error(params)
        log.send('ERROR', params)
    }

    public static debug(params: string) {
        electronLog.debug(params)
        log.send('DEBUG', params)
    }
}


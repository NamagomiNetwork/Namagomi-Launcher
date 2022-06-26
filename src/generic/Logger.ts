import BrowserWindow = Electron.BrowserWindow

const electronLog = require('electron-log')

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export class log {
    private static mainWindow: BrowserWindow

    public static initialize(mainWindow: BrowserWindow) {
        log.mainWindow = mainWindow
    }

    static send = (level: string, contents: string) => log.mainWindow.webContents.send('log', level, contents)

    public static info(params: any) {
        electronLog.info(params)
        log.send('INFO', params.toString())
    }

    public static warn(params: any) {
        electronLog.warn(params)
        log.send('WARN', params.toString())
    }

    public static error(params: any) {
        electronLog.error(params)
        log.send('ERROR', params.toString())
    }

    public static debug(params: any) {
        electronLog.debug(params)
        log.send('DEBUG', params.toString())
    }

    public static log(loglevel: LogLevel,params: any) {
        switch (loglevel) {
            case 'debug':
                log.debug(params)
                break
            case 'info':
                log.info(params)
                break
            case 'warn':
                log.warn(params)
                break
            case 'error':
                log.error(params)
                break
        }
    }
}
import path from 'path'
import {searchDevtools} from 'electron-search-devtools'
import {BrowserWindow, app, ipcMain, session} from 'electron'
import {mainApiRegistry} from './main/namagomi/api/apiRegister'
import {log} from './generic/Logger'

const electronLog = require('electron-log')
electronLog.transports.file.archiveLog(electronLog.transports.file.getFile().path)

const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
    const execPath =
        process.platform === 'win32'
            ? '../node_modules/electron/dist/electron.exe'
            : '../node_modules/.bin/electron'

    require('electron-reload')(__dirname, {
        electron: path.resolve(__dirname, execPath)
    })
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    log.initialize(mainWindow)

    mainApiRegistry(mainWindow)

    ipcMain.on('update-title', (_e, arg) => {
        mainWindow.setTitle(`Electron React TypeScript: ${arg}`)
    })

    searchDevtools('REACT')
        .then((devtools) => {
            session.defaultSession.loadExtension(devtools, {
                allowFileAccess: true
            })
        })
        .catch((err) => log.error(err))

    if (isDev) {
        mainWindow.webContents.openDevTools({mode: 'detach'})
    }

    mainWindow.setMenu(null)

    mainWindow.loadFile('dist/index.html').then()
}

app.whenReady().then(createWindow)
app.once('window-all-closed', () => app.quit())
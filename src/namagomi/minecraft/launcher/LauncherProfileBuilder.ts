import UUID from 'uuidjs'
import path from 'path'
import {app} from 'electron'
import * as fs from "fs";

type SetPattern = 'uniqueId' | 'created' | 'gameDir' | 'icon' | 'javaArgs' | 'lastUsed' | 'lastVersionId' | 'name' | 'type'

export class LauncherProfileBuilder {
    private uniqueId: string
    private created: string
    private gameDir: string
    private icon: string
    private javaArgs: string
    private lastUsed: string
    private lastVersionId: string
    private name: string
    private type: string

    constructor() {
        this.uniqueId = UUID.generate()
        this.created = new Date().toISOString()
        this.gameDir = ''
        this.icon = 'Furnace'
        this.javaArgs = '-Xmx8G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M'
        this.lastUsed = new Date().toISOString()
        this.lastVersionId = ''
        this.name = 'new profile'
        this.type = 'custom'
    }

    private static getProfilePath () {
        switch (process.platform){
            case 'win32':
                return path.join(app.getPath('appData'),'.minecraft\\launcher_profiles.json')
            case 'darwin':
                return path.join(app.getPath('appData'),'minecraft/launcher_profiles.json')
            case 'linux':
                return path.join(app.getPath('home'), '.minecraft/launcher_profiles.json')
            default:
                return path.join(app.getPath('appData'),'.minecraft\\launcher_profiles.json')
        }
    }

    public set(key: SetPattern , value: string): LauncherProfileBuilder {
        switch (key) {
            case 'uniqueId':
                this.uniqueId = value
                break
            case 'created':
                this.created = value
                break
            case 'gameDir':
                this.gameDir = value
                break
            case 'icon':
                this.icon = value
                break
            case 'javaArgs':
                this.javaArgs = value
                break
            case 'lastUsed':
                this.lastUsed = value
                break
            case 'lastVersionId':
                this.lastVersionId = value
                break
            case 'name':
                this.name = value
                break
            case 'type':
                this.type = value
                break
        }
        return this
    }

    public build() {
        const builtJson = JSON.parse("{}")
        builtJson['created'] = this.created
        builtJson['gameDir'] = this.gameDir
        builtJson['icon'] = this.icon
        builtJson['javaArgs'] = this.javaArgs
        builtJson['lastUsed'] = this.lastUsed
        builtJson['lastVersionId'] = this.lastVersionId
        builtJson['name'] = this.name
        builtJson['type'] = this.type

        console.log(builtJson.toString())

        const launcherProfiles = JSON.parse(fs.readFileSync(LauncherProfileBuilder.getProfilePath(), 'utf8'))
        launcherProfiles['profiles'][this.uniqueId] = builtJson
        fs.writeFileSync(LauncherProfileBuilder.getProfilePath(), JSON.stringify(launcherProfiles))
    }
}

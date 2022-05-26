import UUID from 'uuidjs'
import path from 'path'
import {app} from 'electron'

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

    private builtString: string
    private builtJson: any

    public profile_path: string

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
        this.builtString = ''
        this.profile_path = LauncherProfileBuilder.getProfilePath()
    }

    private static getProfilePath () {
        switch (process.platform){
            case 'win32':
                return path.join(app.getPath('appData'),'Roaming\\.minecraft\\launcher_profiles.json')
            case 'darwin':
                return path.join(app.getPath('appData'),'minecraft/launcher_profiles.json')
            case 'linux':
                return path.join(app.getPath('home'), '.minecraft/launcher_profiles.json')
            default:
                return path.join(app.getPath('appData'),'Roaming\\.minecraft\\launcher_profiles.json')
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
        this.builtString =
            '{\n' +
            '  "created": "' + this.created + '",\n' +
            '  "gameDir": "' + this.gameDir + '",\n' +
            '  "icon": "' + this.icon + '",\n' +
            '  "javaArgs": "' + this.javaArgs + '",\n' +
            '  "lastUsed": "' + this.lastUsed + '",\n' +
            '  "lastVersionId": "' + this.lastVersionId + '",\n' +
            '  "name": "' + this.name + '",\n' +
            '  "type": "' + this.type + '"\n' +
            '}'
        this.builtJson = JSON.parse(this.builtString)
        fetch(this.profile_path).then(
            (response) => {
                response.json().then(
                    (json) => {
                        json['profiles'][this.uniqueId] = this.builtJson
                    }
                )
            }
        )
    }
}

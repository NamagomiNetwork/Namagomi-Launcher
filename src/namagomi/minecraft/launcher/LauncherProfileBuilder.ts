import UUID from 'uuidjs'

class LauncherProfileBuilder {
    private uuid: string
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

    constructor() {
        this.uuid = UUID.generate()
        this.created = new Date().toISOString()
        this.gameDir = ''
        this.icon = 'Furnace'
        this.javaArgs = '-Xmx8G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M'
        this.lastUsed = new Date().toISOString()
        this.lastVersionId = ''
        this.name = 'new profile'
        this.type = 'custom'
        this.builtString = ''
    }

    set(key: string, value: string): LauncherProfileBuilder {
        switch (key) {
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
            default:
                break
        }
        return this
    }

    build(): LauncherProfileBuilder {
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
        return this
    }
}

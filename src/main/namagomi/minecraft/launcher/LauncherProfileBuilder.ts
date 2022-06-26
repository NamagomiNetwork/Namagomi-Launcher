import UUID from 'uuidjs'
import path from 'path'
import {app} from 'electron'
import * as fs from 'fs'
import {log} from '../../../../generic/Logger'

type SetPattern =
    'uniqueId'
    | 'created'
    | 'gameDir'
    | 'icon'
    | 'javaArgs'
    | 'lastUsed'
    | 'lastVersionId'
    | 'name'
    | 'type'

export type LauncherProfile = {
    uniqueId: string
    created: string
    gameDir: string
    icon: string
    javaArgs: string
    lastUsed: string
    lastVersionId: string
    name: string
    type: string
}

export function apply(): LauncherProfile {
    return {
        uniqueId: UUID.generate(),
        created: new Date().toISOString(),
        gameDir: '',
        icon: '',
        javaArgs: '-Xmx8G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M',
        lastUsed: new Date().toISOString(),
        lastVersionId: '',
        name: 'new profile',
        type: 'custom'
    }
}

function getProfilePath() {
    switch (process.platform) {
        case 'win32':
            return path.join(app.getPath('appData'), '.minecraft\\launcher_profiles.json')
        case 'darwin':
            return path.join(app.getPath('appData'), 'minecraft/launcher_profiles.json')
        case 'linux':
            return path.join(app.getPath('home'), '.minecraft/launcher_profiles.json')
        default:
            return path.join(app.getPath('appData'), '.minecraft\\launcher_profiles.json')
    }
}

export function set(key: SetPattern, value: string) {
    return (profile: LauncherProfile): LauncherProfile => {
        switch (key) {
            case 'uniqueId':
                return {
                    ...profile,
                    uniqueId: value
                }
            case 'created':
                return {
                    ...profile,
                    created: value
                }
            case 'gameDir':
                return {
                    ...profile,
                    gameDir: value
                }
            case 'icon':
                return {
                    ...profile,
                    icon: value
                }
            case 'javaArgs':
                return {
                    ...profile,
                    javaArgs: value
                }
            case 'lastUsed':
                return {
                    ...profile,
                    lastUsed: value
                }
            case 'lastVersionId':
                return {
                    ...profile,
                    lastVersionId: value
                }
            case 'name':
                return {
                    ...profile,
                    name: value
                }
            case 'type':
                return {
                    ...profile,
                    type: value
                }
        }
    }
}

export function build(profile: LauncherProfile) {
    const builtJson = JSON.parse('{}')
    builtJson['created'] = profile.created
    builtJson['gameDir'] = profile.gameDir
    builtJson['icon'] = profile.icon
    builtJson['javaArgs'] = profile.javaArgs
    builtJson['lastUsed'] = profile.lastUsed
    builtJson['lastVersionId'] = profile.lastVersionId
    builtJson['name'] = profile.name
    builtJson['type'] = profile.type

    if (fs.existsSync(getProfilePath())) {
        const launcherProfiles = JSON.parse(fs.readFileSync(getProfilePath(), 'utf8'))
        launcherProfiles['profiles'][profile.uniqueId] = builtJson
        fs.writeFileSync(getProfilePath(), JSON.stringify(launcherProfiles))
    } else {
        log.error(`${getProfilePath()} is not exists`)
    }
}

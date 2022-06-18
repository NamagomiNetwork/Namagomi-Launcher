import {none, Option, some} from 'fp-ts/Option'

const log = require('electron-log')

export type GetNamagomiModList = GetNamagomiMod[]

export interface GetNamagomiMod {
    name?: string
    modId?: string
    mcVersion: string
    fileId?: string
    directUrl?: string
    side: 'SERVER' | 'CLIENT' | ''
}

export function tryCastGetNamagomiModList(json: any): Option<GetNamagomiModList> {
    const js = json as GetNamagomiModList
    if (!Array.isArray(js)) return none
    const isExpectedType = js.reduce((result: boolean, namagomiMod) => {
        if (result) {
            if (!(namagomiMod.side === 'SERVER' ||
                namagomiMod.side === 'CLIENT' ||
                namagomiMod.side === '')) {
                log.error(`${namagomiMod.name} has invalid side ${namagomiMod.side}`)
                return false
            }
            if (typeof namagomiMod.directUrl === 'string')
                return true
            else if (typeof namagomiMod.directUrl !== 'undefined') {
                log.error(`${namagomiMod.name} has invalid directUrl ${namagomiMod.directUrl}`)
                return false
            }
            if (typeof namagomiMod.name === 'string' &&
                typeof namagomiMod.modId === 'string' &&
                (typeof namagomiMod.fileId === 'string' ||
                    typeof namagomiMod.fileId === 'undefined'))
                return true
            else {
                log.error(`${namagomiMod.name} has invalid name, modId, fileId`)
                log.error(`name : ${namagomiMod.name}`)
                log.error(`modId : ${namagomiMod.modId}`)
                log.error(`fileId : ${namagomiMod.fileId}`)
                return false
            }

        } else return false
    }, true)
    if (isExpectedType)
        return some(js)
    else
        return none
}

export function tryCastNamagomiMod(json: any): Option<GetNamagomiMod> {
    const namagomiMod = json as GetNamagomiMod
    if (namagomiMod.side === 'SERVER' ||
        namagomiMod.side === 'CLIENT' ||
        namagomiMod.side === '')
        return none
    if (typeof namagomiMod.directUrl === 'string')
        return some(namagomiMod)
    else if (typeof namagomiMod.directUrl !== 'undefined')
        return none
    if (typeof namagomiMod.name === 'string' &&
        typeof namagomiMod.modId === 'string' &&
        (typeof namagomiMod.fileId === 'string' ||
            typeof namagomiMod.fileId === 'undefined'))
        return some(namagomiMod)
    return none
}
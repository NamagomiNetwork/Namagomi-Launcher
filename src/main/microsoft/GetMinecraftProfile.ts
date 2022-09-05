export interface GetMinecraftProfile {
}

export interface Ok extends GetMinecraftProfile {
    id: string // the real uuid of the account
    name: string // the mc username of the account
    skins: Skin[]
    capes: Cape[]
}

interface Skin {
    id: string
    state: string
    url: string
    variant: string
    alias: string
}

interface Cape {
    // TODO: いつか調べる
}

export interface Error extends GetMinecraftProfile {
    path: string
    errorType: string
    error: string
    errorMessage: string
    developerMessage: string
}
export type GetNamagomiModList = GetNamagomiMod[]

export interface GetNamagomiMod {
    name: string | null
    modId: string | null
    mcVersion: string
    modVersion: string | null
    directUrl: string | null
    side: 'SERVER' | 'CLIENT' | ''
}
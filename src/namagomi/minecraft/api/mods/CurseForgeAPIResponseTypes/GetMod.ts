export interface GetMod {
    data: Data
}

interface Data {
    id: number
    gameId: number
    name: string
    slug: string
    links: Links
    summary: string
    status: number
    downloadCount: number
    isFeatured: boolean
    primaryCategoryId: number
    categories: Category[]
    classId: number
    authors: Author[]
    logo: Logo
    screenshots: Screenshot[]
    mainFileId: number
    latestFiles: LatestFile[]
    latestFilesIndexes: LatestFilesIndex[]
    dateCreated: string
    dateModified: string
    dateReleased: string
    allowModDistribution: boolean
    gamePopularityRank: number
    isAvailable: boolean
    thumbsUpCount: number
}

interface Links {
    websiteUrl: string
    wikiUrl: string
    issuesUrl: string
    sourceUrl: string
}

interface Category {
    id: number
    gameId: number
    name: string
    slug: string
    url: string
    iconUrl: string
    dateModified: string
    isClass: boolean
    classId: number
    parentCategoryId: number
    displayIndex: number
}

interface Author {
    id: number
    name: string
    url: string
}

interface Logo {
    id: number
    modId: number
    title: string
    description: string
    thumbnailUrl: string
    url: string
}

interface Screenshot {
    id: number
    modId: number
    title: string
    description: string
    thumbnailUrl: string
    url: string
}

interface LatestFile {
    id: number
    gameId: number
    modId: number
    isAvailable: boolean
    displayName: string
    fileName: string
    releaseType: number
    fileStatus: number
    hashes: Hash[]
    fileDate: string
    fileLength: number
    downloadCount: number
    downloadUrl: string
    gameVersions: string[]
    sortableGameVersions: SortableGameVersion[]
    dependencies: Dependency[]
    exposeAsAlternative: boolean
    parentProjectFileId: number
    alternateFileId: number
    isServerPack: boolean
    serverPackFileId: number
    fileFingerprint: number
    modules: Module[]
}

interface Hash {
    value: string
    algo: number
}

interface SortableGameVersion {
    gameVersionName: string
    gameVersionPadded: string
    gameVersion: string
    gameVersionReleaseDate: string
    gameVersionTypeId: number
}

interface Dependency {
    modId: number
    relationType: number
}

interface Module {
    name: string
    fingerprint: number
}

interface LatestFilesIndex {
    gameVersion: string
    fileId: number
    filename: string
    releaseType: number
    gameVersionTypeId: number
    modLoader: number
}
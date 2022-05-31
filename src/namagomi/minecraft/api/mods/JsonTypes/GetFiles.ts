export interface GetFiles {
    data: Data[];
    pagination: Pagination;
}

interface Pagination {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
}

interface Data {
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes: Hash[];
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    downloadUrl?: string;
    gameVersions: string[];
    sortableGameVersions: SortableGameVersion[];
    dependencies: string[];
    alternateFileId: number;
    isServerPack: boolean;
    fileFingerprint: number;
    modules: Module[];
}

interface Module {
    name: string;
    fingerprint: number;
}

interface SortableGameVersion {
    gameVersionName: string;
    gameVersionPadded: string;
    gameVersion: string;
    gameVersionReleaseDate: string;
    gameVersionTypeId: number;
}

interface Hash {
    value: string;
    algo: number;
}
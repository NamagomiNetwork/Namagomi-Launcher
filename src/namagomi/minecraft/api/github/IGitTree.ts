import {GitTree} from "./GitTree";

export interface IGitTree {
    data: {path: string, type: 'blob' | 'tree', sha: string, url: string}
    children: GitTree[]

    getAllPaths(): Promise<string[]>
    getAllFilePaths(): Promise<string[]>
    getAllDirectoryPaths(): Promise<string[]>
    getData(path: string): GitTree
    exists(path: string): boolean
}
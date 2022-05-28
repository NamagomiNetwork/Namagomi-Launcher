import {GitTree} from "./GitTree";

export interface IGitTree {
    data: {path: string, type: 'blob' | 'tree', sha: string, url: string}
    children: GitTree[]

    getAllPaths(): Promise<string[]>
    getData(path: string): Promise<GitTree>
}
import fetch from 'electron-fetch'
import {IGitTree} from './IGitTree'
import {GetGitTrees} from './GetGitTrees'

export class GitTree implements IGitTree {
    data: { path: string, type: 'blob' | 'tree', sha: string, url: string }
    children: GitTree[]

    constructor() {
        this.data = {path: '', type: 'tree', sha: '', url: ''}
        this.children = []
    }

    public async build(owner: string, repo: string, sha: string, path?: string, type?: 'blob' | 'tree', url?: string) {
        this.data.sha = sha
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`
        if (path == null || type == null || url == null) {
            await this.fetchTree(owner, repo, apiUrl)
        } else {
            this.data.path = path
            this.data.type = type
            this.data.url = url
            if (type === 'tree')
                await this.fetchTree(owner, repo, url)
        }
        return this
    }

    private async fetchTree(owner: string, repo: string, apiUrl: string) {
        await fetch(apiUrl).then(p => p.json()).then(async (json: GetGitTrees) => {
            await Promise.all(json.tree.map(async (item) => {
                const path = item.path
                const type = item.type
                const sha = item.sha
                const url = item.url
                this.children.push(await new GitTree().build(owner, repo, sha, path, type, url))
            }))
        })
    }

    public async getAllPaths(): Promise<string[]> {
        const result: string[] = []
        await this.getAllPathsRecursive(result, '')
        return result
    }

    private async getAllPathsRecursive(result: string[], pwd: string): Promise<void> {
        if (this.data.type === 'blob') {
            result.push(pwd)
        } else {
            result.push(pwd)
            this.children.map(async (child: GitTree) => {
                await child.getAllPathsRecursive(result, `${pwd}/${child.data.path}`)
            })
        }
    }

    public async getAllFilePaths(): Promise<string[]> {
        const result: string[] = []
        await this.getAllFilePathsRecursive(result, '')
        return result
    }

    private async getAllFilePathsRecursive(result: string[], pwd: string): Promise<void> {
        if (this.data.type === 'blob') {
            result.push(pwd)
        } else {
            this.children.map(async (child: GitTree) => {
                await child.getAllFilePathsRecursive(result, `${pwd}/${child.data.path}`)
            })
        }
    }

    public async getAllDirectoryPaths(): Promise<string[]> {
        const result: string[] = []
        await this.getAllDirectoryPathsRecursive(result, '')
        return result
    }

    private async getAllDirectoryPathsRecursive(result: string[], pwd: string): Promise<void> {
        if (this.data.type === 'tree') {
            result.push(pwd)
            this.children.map(async (child: GitTree) => {
                await child.getAllDirectoryPathsRecursive(result, `${pwd}/${child.data.path}`)
            })
        }
    }

    public getData(path: string) {
        const paths = path.split('/').filter(p => p !== '')
        return paths.reduce(
            (tree: GitTree, path: string) => {
                const found = tree.children.find(
                    (value: GitTree) =>
                        value.data.path === path)
                if (found == undefined) {
                    throw new Error(`${paths} not found. no such file or directory`)
                } else {
                    return found
                }
            }, this)
    }

    public exists(path: string) {
        try {
            this.getData(path)
            return true
        } catch (e) {
            return false
        }
    }
}
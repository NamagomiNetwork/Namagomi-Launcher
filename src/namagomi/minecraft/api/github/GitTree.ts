class GitTree {
    path: string
    type: 'blob' | 'tree'
    sha: string
    url: string
    children: GitTree[]

    constructor() {
        this.path = ''
        this.type = 'tree'
        this.sha = ''
        this.url = ''
        this.children = []
    }

    public async build(owner: string, repo: string, sha: string, path?: string, type?: 'blob' | 'tree', url?: string) {
        this.sha = sha
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`
        if (path == null) {
            await this.fetchTree(owner, repo, apiUrl)
        } else if (url != null && type != null) {
            this.path = path
            this.type = type
            this.url = url
            if (type === 'tree')
                await this.fetchTree(owner, repo, url)
        }
        return this
    }

    private async fetchTree(owner: string, repo: string, apiUrl: string) {
        await fetch(apiUrl).then(p => p.json()).then(json => {
            json['tree'].map(async (item: any) => {
                const path = item['path']
                const type = item['type']
                const sha = item['sha']
                const url = item['url']
                this.children.push(await new GitTree().build(owner, repo, sha, path, type, url))
            })
        })
    }

    public async getAllPaths(): Promise<string[]> {
        const result: string[] = []
        await this.getAllPathsRecursive(result, '')
        return result
    }

    private async getAllPathsRecursive(result: string[], pwd: string): Promise<void> {
        if (this.type === 'blob') {
            result.push(this.path)
        } else {
            this.children.map(async (child: GitTree) => {
                await child.getAllPathsRecursive(result, `${pwd}/${child.path}`)
            })
        }
    }
}
export interface GetGitTrees {
    sha: string
    url: string
    tree: Tree[]
    truncated: boolean
}

interface Tree {
    path: string
    mode: string
    type: 'blob' | 'tree'
    sha: string
    url: string
}
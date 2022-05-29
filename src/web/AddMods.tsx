import React from "react";

export class AddMods extends React.Component<{}, {files:string[]}> {
    constructor(props: any) {
        super(props);
        this.onFileDrop = this.onFileDrop.bind(this);
    }

    state = {
        files: [] as string[]
    }

    async onFileDrop(e: React.DragEvent<HTMLDivElement>) {
        e.stopPropagation()

        const paths = Array.from(e.dataTransfer.files).map(file => file.path)
        const names = Array.from(e.dataTransfer.files).map(file => file.name)
        const res = window.namagomiAPI.addMods(paths, names)
        this.state.files = this.state.files.concat(await res)
    }

    render() {
        return (
            <div onDrop={this.onFileDrop} id="drop">mod files drop here</div>
        )
    }
}
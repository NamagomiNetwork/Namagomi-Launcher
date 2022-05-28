import React from "react";

export class AddMods extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
        this.onFileDrop = this.onFileDrop.bind(this);
    }

    async onFileDrop(e: React.DragEvent<HTMLDivElement>) {
        e.stopPropagation()

        const paths = Array.from(e.dataTransfer.files).map(file => file.path)
        const names = Array.from(e.dataTransfer.files).map(file => file.name)
        window.namagomiAPI.addMods(paths, names).then()
    }

    render() {
        return (
            <div onDrop={this.onFileDrop} id="drop">mod files drop here</div>
        )
    }
}
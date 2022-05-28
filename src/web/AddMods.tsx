import React from "react";

export class AddMods extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
        this.onFileDrop = this.onFileDrop.bind(this);
    }

    async onFileDrop(e: React.DragEvent<HTMLDivElement>) {
        e.stopPropagation()

        const files = e.dataTransfer.files
        window.namagomiAPI.addMods(files)
    }

    render() {
        return (
            <div onDrop={this.onFileDrop} id="drop">mod files drop here</div>
        )
    }
}
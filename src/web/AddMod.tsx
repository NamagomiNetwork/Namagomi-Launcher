import React from "react";

export class AddMod extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
        this.onFileDrop = this.onFileDrop.bind(this);
    }

    onFileDrop(e:React.DragEvent<HTMLDivElement>) {
        e.stopPropagation()

        const files = e.dataTransfer.files
        Array.from(files).map(file => console.log(file))
    }

    render() {
        return (
            <div onDrop={this.onFileDrop} id="drop">mod files drop here</div>
        )
    }
}
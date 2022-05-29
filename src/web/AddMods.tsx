import React from "react";
import {ModList} from "./ModList";

export class AddMods extends React.Component<{}, { files: string[] }> {
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
        const concatFiles = this.state.files.concat(await res)
        this.setState({files: concatFiles})
    }

    async componentWillMount() {
        this.setState({files: await window.namagomiAPI.getIgnoreList()})
    }

    render() {
        return (
            <div>
                <div onDrop={this.onFileDrop} id="drop">mod files drop here</div><br/>
                <ModList files={this.state.files}/>
            </div>
        )

    }
}
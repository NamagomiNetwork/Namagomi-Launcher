import React from "react";
import {ModList} from "./ModList";
import "./AddMods.css";

export class AddMods extends React.Component<{side: string}, { files: string[] }> {
    constructor(props: {side: string}) {
        super(props);
        this.onFileDrop = this.onFileDrop.bind(this);
        this.freshList = this.freshList.bind(this);
    }

    state = {
        files: [] as string[]
    }

    async freshList() {
        this.setState({files: await window.namagomiAPI.getIgnoreList(this.props.side)})
    }

    async onFileDrop(e: React.DragEvent<HTMLDivElement>) {
        e.stopPropagation()

        const paths = Array.from(e.dataTransfer.files).map(file => file.path)
        const names = Array.from(e.dataTransfer.files).map(file => file.name)
        await window.namagomiAPI.addMods(paths, names, this.props.side)
        this.freshList().then()
    }

    async componentDidMount() {
        this.freshList().then()
    }

    render() {
        return (
            <div>
                <span onDrop={this.onFileDrop} id="drop">mod files drop here ({this.props.side})</span><br/>
                <ModList files={this.state.files} freshList={this.freshList} side={this.props.side}/>
            </div>
        )

    }
}
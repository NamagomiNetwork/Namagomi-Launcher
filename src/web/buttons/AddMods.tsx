import React, {useEffect, useState} from "react"
import {ModList} from "../ModList"
import '../AddMods.css'

type Props = {side: string}

export const AddMods = ({side}: Props) => {
    const [files, setFiles] = useState<string[]>([])

    useEffect(() => {
        freshList()
    })

    function freshList() {
        const fresh = async () => {
            const ignoreList = await window.namagomiAPI.getIgnoreList(side)
            setFiles(ignoreList)
        }
        fresh().then()
    }

    function onFileDrop(e: React.DragEvent<HTMLDivElement>) {
        e.stopPropagation()

        const paths = Array.from(e.dataTransfer.files).map(file => file.path)
        const names = Array.from(e.dataTransfer.files).map(file => file.name)
        window.namagomiAPI.addMods(paths, names, side)
            .then(() => freshList())
    }

    return (
        <div>
            <span onDrop={onFileDrop} id="drop">mod files drop here</span><br/>
            <ModList files={files} freshList={freshList} side={side}/>
        </div>
    )
}
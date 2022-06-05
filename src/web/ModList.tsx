import React from "react";

type Props = {
    files: string[]
    freshList: () => void
    side: string
}

function removeMod(mod: string, side: string) {
    window.namagomiAPI.removeMods([mod], side).then()
}

export const ModList: React.FC<Props> = ({files, freshList, side}) => (
    <div id="mod list">
        <table>
            <tbody>
            {files.map((file: string, index: number) => {
                return <tr key={index}>
                    <td><input type={"checkbox"}/></td>
                    <td>{file}</td>
                    <td>
                        <input type={"submit"} value={"delete"} onClick={() => {
                            removeMod(file, side)
                            freshList()
                        }}/>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
    </div>
)
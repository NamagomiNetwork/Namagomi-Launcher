import React from "react";

type Props = {
    files: string[]
    freshList: () => void
}

function removeMod(mod: string) {
    window.namagomiAPI.removeMods([mod]).then()
}

export const ModList: React.FC<Props> = ({files, freshList}) => (
    <div id="mod list">
        <table>
            <tbody>
            {files.map((file: string, index: number) => {
                return <tr key={index}>
                    <td><input type={"checkbox"}/></td>
                    <td>{file}</td>
                    <td>
                        <input type={"submit"} value={"delete"} onClick={() => {
                            removeMod(file)
                            freshList()
                        }}/>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
    </div>
)
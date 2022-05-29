import React from "react";

type Props = {
    files: string[]
}

function rmMod(mod: string) {
    console.log(mod)
}

export const ModList: React.FC<Props> = ({files}) => (
    <div id="mod list">
        <table>
            <tr>
                <th></th>
                <th>file</th>
                <th></th>
            </tr>
        {files.map((file: string, index: number) => {
            return <div>
                <tr>
                    <input type={"checkbox"}/>
                    <td>{file}</td>
                    <td>
                        <input type={"submit"} value={"削除"} onClick={() => rmMod(file)}/>
                    </td>
                </tr>
            </div>
        })}
        </table>
    </div>
)
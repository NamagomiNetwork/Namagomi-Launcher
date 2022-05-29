import React from "react";
import {removeMods} from "../namagomi/minecraft/api/mods/addMod";

type Props = {
    files: string[]
}

function removeMod(mod: string) {
    removeMods([mod]);
}

export const ModList: React.FC<Props> = ({files}) => (
    <div id="mod list">
        <table>
            <tbody>
            {files.map((file: string, index: number) => {
                return <tr key={index}>
                    <td><input type={"checkbox"}/></td>
                    <td>{file}</td>
                    <td>
                        <input type={"submit"} value={"削除"} onClick={() => removeMod(file)}/>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
    </div>
)
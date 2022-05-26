import React from 'react';
import './App.css';
import {
    downloadClientModFiles,
    downloadServerModFiles,
    sampleDownloadModFiles
} from "../namagomi/minecraft/api/curse_forge";
import {setup} from "../namagomi/minecraft/launcher/setupNamagomiLauncherProfile";
export const App = () => {
    return (
        <div className="container">
            <div>
                <button onClick={downloadClientModFiles}>&#x25BC;</button>
                <button onClick={setup}>&#x25B2;</button>
            </div>
        </div>
    );
};

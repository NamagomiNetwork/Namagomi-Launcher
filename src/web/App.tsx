import React from 'react';
import './App.css';
import {downloadServerModFiles, sampleDownloadModFiles} from "../namagomi/minecraft/api/curse_forge";
export const App = () => {
    return (
        <div className="container">
            <div>
                <button onClick={sampleDownloadModFiles}>&#x25BC;</button>
                <button onClick={downloadServerModFiles}>&#x25B2;</button>
            </div>
        </div>
    );
};

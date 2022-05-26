import React from 'react';
import './App.css';
import {downloadServerModFiles, sampleDownloadServerModFiles} from "../namagomi/minecraft/api/curse_forge";
export const App = () => {
    return (
        <div className="container">
            <div>
                <button onClick={sampleDownloadServerModFiles}>&#x25BC;</button>
                <button onClick={downloadServerModFiles}>&#x25B2;</button>

            </div>
        </div>
    );
};

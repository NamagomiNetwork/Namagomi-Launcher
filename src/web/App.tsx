import React from 'react';
import './App.css';

export const App = () => {
    return (
        <div className="container">
            <div>
                <button onClick={window.namagomiAPI.sampleDownloadModFilesDev}>sampleDownloadModFilesDev</button>
                <button onClick={window.namagomiAPI.setupNamagomiLauncherProfile}>setupNamagomiLauncherProfile</button>
            </div>
        </div>
    );
};

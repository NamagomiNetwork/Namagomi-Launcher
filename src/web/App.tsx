import React from 'react';
import './App.css';

export const App = () => {
    return (
        <div className="container">
            <div>
                <button onClick={window.namagomiAPI.downloadModFilesDev}>DownloadModFilesDev</button>
                <button onClick={window.namagomiAPI.downloadClientModFiles}>DownloadClientModFiles</button>
                <button onClick={window.namagomiAPI.downloadServerModFiles}>DownloadServerModFiles</button>
                <button onClick={window.namagomiAPI.setupNamagomiLauncherProfile}>SetupNamagomiLauncherProfile</button>
                <button onClick={window.namagomiAPI.BuildGitTree}>BuildGitTree</button>
            </div>
        </div>
    );
};

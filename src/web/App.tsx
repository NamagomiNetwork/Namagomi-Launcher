import React from 'react';
import './App.css';

export const App = () => {
    return (
        <div className="container">
            <div>
                <button onClick={window.namagomiAPI.downloadAllModFiles}>&#x25BC;</button>
                <button onClick={window.namagomiAPI.setupNamagomiLauncherProfile}>&#x25B2;</button>
            </div>
        </div>
    );
};

import React from 'react';

import './index.css';

import {
    downloadAllModFiles,
    downloadClientModFiles,
    downloadServerModFiles
} from "../namagomi/minecraft/api/curse_forge";
import {createRoot} from "react-dom/client";

class AllDownloadButton extends React.Component {
    render() {
        return <button onClick={downloadAllModFiles}>
            All
        </button>
    }
}

class ServerDownloadButton extends React.Component {
    render() {
        return <button onClick={downloadServerModFiles}>
            Server
        </button>
    }
}

class ClientDownloadButton extends React.Component {
    render() {
        return <button onClick={downloadClientModFiles}>
            Client
        </button>
    }
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
    <li>
        <AllDownloadButton/>
        <ServerDownloadButton/>
        <ClientDownloadButton/>
    </li>
)
import React from 'react';
import './App.css';
import {AddMods} from "./AddMods";

export const App = () => {
    return (
        <div className="container">
            <div>
                <Buttons />
            </div><br/>
            <AddMods />
        </div>
    );
};

class Buttons extends React.Component<{}, {value: string}> {
    constructor(props: any) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: any) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event: any) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <button onClick={window.namagomiAPI.downloadAllModFiles}>DownloadAllModFiles</button>
                <button onClick={window.namagomiAPI.downloadClientModFiles}>DownloadClientModFiles</button>
                <button onClick={window.namagomiAPI.downloadServerModFiles}>DownloadServerModFiles</button>
                <button onClick={window.namagomiAPI.downloadAllConfigFiles}>DownloadAllConfigFile</button>
                <button onClick={window.namagomiAPI.setupNamagomiLauncherProfile}>SetupNamagomiLauncherProfile</button>
                <button onClick={window.namagomiAPI.BuildGitTree}>BuildGitTree</button>
                <button onClick={()=>window.namagomiAPI.GetGitFileData(this.state.value)}>GetFileData</button>
                    <input type="text" id="filePath" value={this.state.value} onChange={this.handleChange} />
                <button onClick={window.namagomiAPI.OpenFolder}>OpenFolder</button>
            </div>
        );
    }
}
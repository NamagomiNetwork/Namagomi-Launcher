import React from 'react';
import './App.css';
import {AddMods} from './AddMods'

export const App = () => {
    return (
        <div className="container">
            <Buttons/><br/>
            <AddMods/>
        </div>
    );
};

type State = {
    value: string,
    updateAvailable: boolean,
    manuallyMods: string[]
}

class Buttons extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            value: '',
            updateAvailable: false,
            manuallyMods: [] as string[]
        };

        this.handleChange = this.handleChange.bind(this);
        this.checkUpdate = this.checkUpdate.bind(this)
        this.showManuallyMods = this.showManuallyMods.bind(this)
        this.setupAll = this.setupAll.bind(this)
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({value: event.target.value});
    }

    checkUpdate() {
        window.namagomiAPI.isLatestMods().then(isLatest => {
            this.setState({updateAvailable: !isLatest})
        })
    }

    componentDidMount() {
        this.checkUpdate()
    }

    async showManuallyMods(modIds: Promise<string[]>) {
        this.setState({manuallyMods: await modIds})
    }

    async setupAll() {
        await this.showManuallyMods(window.namagomiAPI.downloadClientModFiles())
        await window.namagomiAPI.downloadAllConfigFiles()
        await window.namagomiAPI.setupNamagomiLauncherProfile()
        this.checkUpdate()
    }

    render() {
        return (
            <div>
                <button onClick={this.setupAll}>Update</button>
                <button onClick={this.checkUpdate}>updatable: {this.state.updateAvailable ? '更新可能' : '最新の状態です'}</button>
                <button onClick={window.namagomiAPI.OpenFolder}>OpenFolder</button>
                <br/>
                {
                    this.state.manuallyMods.length === 0
                        ? <p></p>
                        : <p>以下のmodは手動でダウンロードしてください</p>
                }
                {
                    this.state.manuallyMods.map((mod, index) =>
                        <a key={index} href={mod} target={"_blank"} rel={"noopener nofollow"}>
                            {mod}<br/>
                        </a>)}
            </div>
        );
    }
}
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
    updateAvailableClient: boolean,
    updateAvailableServer: boolean,
    manuallyMods: string[]
}

class Buttons extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            value: '',
            updateAvailableClient: false,
            updateAvailableServer: false,
            manuallyMods: [] as string[]
        };

        this.handleChange = this.handleChange.bind(this);
        this.checkUpdateClient = this.checkUpdateClient.bind(this)
        this.checkUpdateServer = this.checkUpdateServer.bind(this)
        this.showManuallyMods = this.showManuallyMods.bind(this)
        this.setupClient = this.setupClient.bind(this)
        this.setupServer = this.setupServer.bind(this)
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({value: event.target.value});
    }

    checkUpdateClient() {
        window.namagomiAPI.isLatestMods('CLIENT').then(isLatest => {
            this.setState({updateAvailableClient: !isLatest})
        })
    }

    checkUpdateServer() {
        window.namagomiAPI.isLatestMods('SERVER').then(isLatest => {
            this.setState({updateAvailableServer: !isLatest})
        })
    }

    componentDidMount() {
        this.checkUpdateClient()
        this.checkUpdateServer()
    }

    async showManuallyMods(modIds: Promise<string[]>) {
        this.setState({manuallyMods: await modIds})
    }

    async setupClient() {
        const side = 'CLIENT'
        await this.showManuallyMods(window.namagomiAPI.downloadClientModFiles())
        await window.namagomiAPI.downloadAllConfigFiles(side)
        await window.namagomiAPI.setupNamagomiLauncherProfile(side)
        this.checkUpdateClient()
    }

    async setupServer() {
        const side = 'SERVER'
        await this.showManuallyMods(window.namagomiAPI.downloadServerModFiles())
        await window.namagomiAPI.downloadAllConfigFiles(side)
        this.checkUpdateServer()
    }

    render() {
        return (
            <div>
                <button onClick={this.setupClient}>Update</button>
                <button onClick={this.checkUpdateClient}>updatable: {this.state.updateAvailableClient ? '更新可能' : '最新の状態です'}</button>
                <button onClick={()=>window.namagomiAPI.OpenFolder('CLIENT')}>OpenFolder</button><br/>
                <button onClick={this.setupServer}>Update Server</button>
                <button onClick={this.checkUpdateServer}>updatable: {this.state.updateAvailableServer ? '更新可能' : '最新の状態です'}</button>
                <button onClick={()=>window.namagomiAPI.OpenFolder('SERVER')}>OpenFolder</button><br/>

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
import React from 'react';

import './index.css';

import ReactDOM from 'react-dom';
import {testFunc} from "../namagomi/minecraft/api/curse_forge";

class Button extends React.Component {
    render() {
        return <button onClick={testFunc}>
            test
        </button>
    }
}

ReactDOM.render(<Button />, document.getElementById('root'));
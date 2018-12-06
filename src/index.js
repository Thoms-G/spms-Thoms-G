import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolios: Array(10).fill(null),
            current_number_of_portfolio: 0,
        };
    }
    addPortefolio(){
        if(this.state.current_number_of_portfolio < 10) {
            ReactDOM.render(
                <Portfolio name={document.getElementById("pf_name").value}/>,
                document.getElementById("pf" + this.state.current_number_of_portfolio));
            this.state.current_number_of_portfolio++;
        } else {
            alert("You have too much portfolios");
        }
    }

    render() {
        return [
            <div>
                <input id="pf_name" type="text"/>
                <button onClick={() => this.addPortefolio()}>Create new portfolio</button>
            </div>,
            <div id="pf0"></div>,
            <div id="pf1"></div>,
            <div id="pf2"></div>,
            <div id="pf3"></div>,
            <div id="pf4"></div>,
            <div id="pf5"></div>,
            <div id="pf6"></div>,
            <div id="pf7"></div>,
            <div id="pf8"></div>,
            <div id="pf9"></div>,
        ]
    }
}

class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    render() {
        return (<p></p>)
    }
}

class Portfolio extends React.Component {
    render() {
        return (
            <div class="portefolio">
                    <h1>{this.props.name}</h1>
            </div>)
    }
}


ReactDOM.render(
<Main/>,
    document.getElementById("root")
);

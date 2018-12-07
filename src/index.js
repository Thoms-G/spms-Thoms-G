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

    addPortfolio() {
        if (this.state.current_number_of_portfolio < 10) {
            ReactDOM.render(
                <Portfolio name={document.getElementById("pf_name").value}/>,
                document.getElementById("pf" + this.state.current_number_of_portfolio));
            this.state.current_number_of_portfolio++;

        } else {
            alert("You have too much portfolios");
        }
    }

    removePortfolio() {

    }

    render() {
        return (
            <div>
                <div>
                    <input id="pf_name" type="text"/>
                    <button onClick={() => this.addPortfolio()}>Create new portfolio</button>
                </div>
                <div id="pf0"/>
                <div id="pf1"/>
                <div id="pf2"/>
                <div id="pf3"/>
                <div id="pf4"/>
                <div id="pf5"/>
                <div id="pf6"/>
                <div id="pf7"/>
                <div id="pf8"/>
                <div id="pf9"/>
            </div>
        )
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
            <div className="portfolio">
                <span>
                    <label>{this.props.name}</label>
                    <button>Show in €</button>
                    <button>Show in $</button>
                </span>
                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Unit. Value</th>
                            <th>Quantity</th>
                            <th>Total Value</th>
                        </tr>
                        </thead>
                    </table>
                </div>
                <div>
                    <button>Add Stock</button>
                    <button>Perf. Graph</button>
                    <button>Remove portfolio</button>
                </div>
            </div>
        )
    }
}


ReactDOM.render(
    <Main/>
    ,
    document.getElementById("root")
);

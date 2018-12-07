import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

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
                    <button onClick={() => this.props.remove(this.props.index)}>Remove portfolio</button>
                </div>
            </div>
        )
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        let portfolios_history = [];
        let nb_pf = 0;
        this.removePortfolio = this.removePortfolio.bind(this);
        if (JSON.parse(localStorage.getItem("portfolios_history"))) {
            portfolios_history = JSON.parse(localStorage.getItem("portfolios_history"));
            nb_pf = portfolios_history.length;
        }

        this.state = {
            portfolios: portfolios_history,
            current_number_of_portfolio: nb_pf,
        };
    }

    addPortfolio =() => {
        if (this.state.current_number_of_portfolio < 10) {
            let newPF = document.getElementById("pf_name").value;
            let tmp_pf = this.state.portfolios;
            tmp_pf.push(newPF);
            let nb_tmp = this.state.current_number_of_portfolio + 1;

            this.setState({
                portfolios: tmp_pf,
                current_number_of_portfolio: nb_tmp
            });

        } else {
            alert("You have too much portfolios");
        }
    };


    removePortfolio = (index) => {
        let tmp_pf = this.state.portfolios;
        tmp_pf.splice(index, 1);
        let nb_tmp = this.state.current_number_of_portfolio - 1;

        this.setState({
            portfolios: tmp_pf,
            current_number_of_portfolio: nb_tmp
        });
    };

    eachPortfolios = (pf, i) => {
        return (<Portfolio name={pf}
                           key={i}
                           index={i}
                           remove={(i) => this.removePortfolio(i)}/>);
    };

    render() {
        return (
            <div>
                <div>
                    <input id="pf_name" type="text"/>
                    <button onClick={() => this.addPortfolio()}>Create new portfolio</button>
                </div>
                {
                    this.state.portfolios.map(this.eachPortfolios)
                }
            </div>
        )
    }
}


ReactDOM.render(
    <Main/>
    ,
    document.getElementById("root")
);



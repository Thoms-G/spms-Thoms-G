import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

class Stock extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.symbol}</td>
                <td></td>
                <td>{this.props.shares}</td>
                <td></td>
                <td><button onClick={() => this.props.deleteStock(this.props.index)}>Delete</button></td>
            </tr>
        );
    }
}

class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addingStock: false,
            stocks: [],
            current_stocks: 0
        }
    }

    savePortfolioState(){
        localStorage.setItem("portfolios"+this.props.index, JSON.stringify(this.state));
    }

    componentDidMount() {
        this.setState(JSON.parse(localStorage.getItem("portfolios"+this.props.index)));

        // add event listener to save state to localStorage
        // when user leaves/refreshes the page
        window.addEventListener(
            "beforeunload",
            this.savePortfolioState.bind(this)
        );
    }

    componentWillUnmount() {
        window.removeEventListener(
            "beforeunload",
            this.savePortfolioState.bind(this)
        );

        // saves if component has a chance to unmount
        this.savePortfolioState();
    }

    remove_stock = (index) => {
        let tmp_stocks = this.state.stocks;
        tmp_stocks.splice(index, 1);
        let nb_tmp = this.state.current_stocks - 1;

        this.setState({
            stocks: tmp_stocks,
            current_stocks: nb_tmp
        });
    };

    add_stock() {
        this.setState({addingStock: true});
    }

    save_stock() {
        //Here we check if the new stock already exist or
        // if the number of different stocks in this portfolio is less than 50
        if(this.state.current_stocks < 50 ||
            typeof (this.state.stocks.find(s => s.symbol === this.refs.symbol.value)) !== 'undefined') {
            let stocks_sym = this.refs.symbol.value;
            let stock_shares = this.refs.number_shares.value;

            let tmp_current_stocks = this.state.current_stocks;
            let tmp_stocks = this.state.stocks;
            //TODO : API call to get unit price
            //TODO : Calculate the toal price of the row
            //Check if the symbol exist in the portfolio and
            // if it is not the case, add 1 top the current number of stocks
            if(typeof (tmp_stocks.find(s => s.symbol === stocks_sym)) === 'undefined'){
                tmp_current_stocks = tmp_current_stocks + 1;
            }

            tmp_stocks.push({symbol: stocks_sym, shares: stock_shares});

            this.setState({addingStock: false, stocks: tmp_stocks, current_stocks: tmp_current_stocks});
        } else {
            alert("You have too much stocks in this portfolio");
        }
    }

    back_to_portfolio(){
        this.setState({addingStock: false});
    }

    each_stock = (stock, i) => {
        return (<Stock symbol={stock.symbol} shares={stock.shares} key={i} index={i}
                       deleteStock={(i) => this.remove_stock(i)}/>)
    };

    render_stock_form () {
        return (
            <div className="portfolio">
                <div>
                    <label htmlFor="symbol">Symbol</label>
                    <input type="text" id="symbol" ref="symbol"/>
                </div>
                <div>
                    <label htmlFor="number_shares">Total number of shares</label>
                    <input type="number" id="number_shares" ref="number_shares"/>
                </div>
                <button onClick={() => this.save_stock()}>Save</button>
                <button onClick={() => this.back_to_portfolio()}>Cancel</button>
            </div>
        )
    }

    render_portfolio() {
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
                            <th>Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.stocks.map(this.each_stock)}
                        </tbody>
                    </table>
                </div>
                <div>
                    <button onClick={() => this.add_stock()}>Add Stock</button>
                    <button>Perf. Graph</button>
                    <button onClick={() => this.props.remove(this.props.index)}>Remove portfolio</button>
                </div>
            </div>
        )
    }

    render() {
        if (this.state.addingStock) {
            return this.render_stock_form()
        } else {
            return this.render_portfolio()
        }
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        let portfolios_history = [];
        let nb_pf = 0;

        /**if (JSON.parse(localStorage.getItem("portfolios_history"))) {
            portfolios_history = JSON.parse(localStorage.getItem("portfolios_history"));
            nb_pf = portfolios_history.length;
        }**/

        this.state = {
            portfolios: portfolios_history,
            current_number_of_portfolio: nb_pf,
        };
    }

    saveMainState(){
        localStorage.setItem("portfolios_history", JSON.stringify(this.state));
    }

    componentDidMount() {
        this.setState(JSON.parse(localStorage.getItem("portfolios_history")));

        // add event listener to save state to localStorage
        // when user leaves/refreshes the page
        window.addEventListener(
            "beforeunload",
            this.saveMainState.bind(this)
        );
    }

    componentWillUnmount() {
        window.removeEventListener(
            "beforeunload",
            this.saveMainState.bind(this)
        );

        // saves if component has a chance to unmount
        this.saveMainState();
    }

    addPortfolio = () => {
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

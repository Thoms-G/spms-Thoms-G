import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

const base_url_iex = "https://api.iextrading.com/1.0";
const API_KEY = "YIY9YZU6E4JU7NUM";
const conversion_url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=" + API_KEY;


class Stock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            unit_price: 0,
            showEUR: false
        }
    }

    componentDidMount() {
        // The stock price will be refresh every 5 sec
        this.update_unit_price();
        this.interval = setInterval(() => this.update_unit_price(), 20000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate(prevProps) {
        if (this.props.showinEur !== prevProps.showinEur) {
            this.setState({showEUR: this.props.showinEur});
        }
    }

    update_unit_price = () => {
        let price_url = base_url_iex + '/stock/' + this.props.symbol + '/price';
        fetch(price_url)
            .then((resp) => resp.json())
            .then(function (data) {
                const u_price = parseFloat(data).toFixed(3);
                this.setState({unit_price: u_price});
            }.bind(this));
    };

    render() {
        if (this.state.showEUR === true) {
            return (
                <tr>
                    <td>{this.props.symbol}</td>
                    <td>{parseFloat(this.state.unit_price * this.props.usdEurexchange).toFixed(3)} €</td>
                    <td>{this.props.shares}</td>
                    <td>{parseFloat(this.state.unit_price * this.props.shares * this.props.usdEurexchange).toFixed(3)} €</td>
                    <td>
                        <button type="button" className="btn btn-warning btn-sm"
                                onClick={() => this.props.deleteStock(this.props.index)}>Delete
                        </button>
                    </td>
                </tr>
            );
        } else {
            return (
                <tr>
                    <td>{this.props.symbol}</td>
                    <td>{this.state.unit_price} $</td>
                    <td>{this.props.shares}</td>
                    <td>{parseFloat(this.state.unit_price * this.props.shares).toFixed(3)} $</td>
                    <td>
                        <button type="button" className="btn btn-warning btn-sm"
                                onClick={() => this.props.deleteStock(this.props.index)}>Delete
                        </button>
                    </td>
                </tr>
            );
        }
    }
}

class Portfolio extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            addingStock: false,
            stocks: [],
            current_stocks: 0,
            total_value: 0,
            loaded: 0,
            inEUR: false,
            usdEur: 0
        };

    }

    savePortfolioState() {
        localStorage.setItem(this.props.name, JSON.stringify(this.state));
    }

    componentWillMount() {
        this.setState(JSON.parse(localStorage.getItem(this.props.name)));
    }

    componentDidMount() {
        this.setState(JSON.parse(localStorage.getItem(this.props.name)));

        // add event listener to save state to localStorage
        // when user leaves/refreshes the page
        window.addEventListener(
            "beforeunload",
            this.savePortfolioState.bind(this)
        );

        fetch(conversion_url)
            .then((resp) => resp.json())
            .then(function (data) {
                let taux = parseFloat(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]).toFixed(3);
                this.setState({usdEur: taux});
            }.bind(this))
            .catch(function (error) {
                alert("Exchange not found")
            });

        // The total value of a portfolios will be refresh every minute
        this.update_total();
        this.interval = setInterval(() => this.update_total(), 20000);
    }

    componentWillUnmount() {
        window.removeEventListener(
            "beforeunload",
            this.savePortfolioState.bind(this)
        );

        // saves if component has a chance to unmount
        this.savePortfolioState();

        clearInterval(this.interval);
    }


    update_total() {
        let tmp_total = 0;
        if (this.state.current_stocks === 0) {
            this.setState({total_value: 0});
        } else {
            for (let i = 0; i < this.state.current_stocks; i++) {
                let s = this.state.stocks[i];
                let price_url = base_url_iex + '/stock/' + s.symbol + '/price';
                fetch(price_url)
                    .then((resp) => resp.json())
                    .then(function (data) {
                        const u_price = parseFloat(data).toFixed(3);
                        tmp_total += u_price * s.shares;
                        this.setState({total_value: tmp_total});
                    }.bind(this));
            }

        }
    }

    remove_stock = (index) => {
        let tmp_stocks = this.state.stocks;
        let stock_price = this.state.stocks[index].unit_price * this.state.stocks[index].shares;
        tmp_stocks.splice(index, 1);
        let nb_tmp = this.state.current_stocks - 1;
        let tmp_total = this.state.total_value - stock_price;
        tmp_total = parseFloat(tmp_total).toFixed(3);

        this.setState({
            stocks: tmp_stocks,
            current_stocks: nb_tmp,
            total_value: tmp_total
        });
    };

    remove_all_stock = () => {
        this.setState({
            stocks: [],
            current_stocks: 0,
            total_value: 0
        });
    };

    show_in_eur = () => {
        this.setState({inEUR: true});
    };

    show_in_usd = () => {
        this.setState({inEUR: false});
    };

    add_stock_state() {
        this.setState({addingStock: true});
    }

    save_stock() {
        //Here we check if the new stock already exist or
        // if the number of different stocks in this portfolio is less than 50
        if (this.state.current_stocks < 50 ||
            typeof (this.state.stocks.find(s => s.symbol === this.refs.symbol.value)) !== 'undefined') {
            let stocks_sym = this.refs.symbol.value;
            let stock_shares = parseInt(this.refs.number_shares.value);
            let tmp_total = this.state.total_value;
            let tmp_current_stocks = this.state.current_stocks;
            let tmp_stocks = this.state.stocks;

            let price_url = base_url_iex + '/stock/' + stocks_sym + '/price';

            fetch(price_url)
                .then((resp) => resp.json())
                .then(function (data) {
                    //Check if the symbol exist in the portfolio and
                    // if it is not the case, add 1 top the current number of stocks
                    if (typeof (tmp_stocks.find(s => s.symbol === stocks_sym)) === 'undefined') {
                        tmp_current_stocks = tmp_current_stocks + 1;
                    }
                    let u_price = parseFloat(data).toFixed(3);
                    tmp_total += u_price * stock_shares;
                    tmp_total = parseFloat(tmp_total).toFixed(3);
                    tmp_stocks.push({symbol: stocks_sym, shares: stock_shares, unit_price: u_price});

                    this.setState({
                        addingStock: false,
                        stocks: tmp_stocks,
                        current_stocks: tmp_current_stocks,
                        total_value: tmp_total
                    });

                }.bind(this))
                .catch(function (error) {
                    alert("Symbol not found" + error)
                });

        } else {
            alert("You have too much stocks in this portfolio");
        }
    }

    back_to_portfolio() {
        this.setState({addingStock: false});
    }

    each_stock = (stock, i) => {
        return (
            <Stock symbol={stock.symbol} shares={stock.shares}
                   key={i} index={i} showinEur={this.state.inEUR} usdEurexchange={this.state.usdEur}
                   deleteStock={(i) => this.remove_stock(i)}
            />)


    };

    render_stock_form() {
        return (
            <div className="mt-2 col-lg-6 col-sm-12 p-1">
                <div className="card ">

                    <h3 className="card-header">{this.props.name}</h3>

                    <div className="form-group">
                        <div>
                            <label htmlFor="symbol">Symbol</label>
                            <input type="text" id="symbol" ref="symbol" className="form-control"/>
                        </div>
                        <div>
                            <label htmlFor="number_shares">Total number of shares</label>
                            <input type="number" id="number_shares" ref="number_shares" className="form-control"/>
                        </div>
                        <div className="btn-toolbar m-2" role="toolbar">
                            <div className="btn-group mr-3" role="group">
                                <button type="button" className="btn btn-success"
                                        onClick={() => this.save_stock()}>Save
                                </button>
                            </div>
                            <div className="btn-group" role="group">
                                <button type="button" className="btn btn-outline-secondary btn"
                                        onClick={() => this.back_to_portfolio()}>Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render_portfolio() {
        let print_total = '';
        if (this.state.inEUR === true) {
            print_total = parseFloat(this.state.usdEur * this.state.total_value).toFixed(3) + '€'
        } else {
            print_total = parseFloat(this.state.total_value).toFixed(3) + '$'
        }
        return (
            <div className="mt-2 col-lg-6 col-sm-12 p-1">
                <div className="card ">

                    <h3 className="card-header">{this.props.name}</h3>
                    <div className="container">
                        <div className="btn-group btn-group-toggle m-1" data-toggle="buttons">
                            <button className="btn btn-secondary float-right" type="radio"
                                    onClick={() => this.show_in_usd()}> Show in $
                            </button>
                            <button className="btn btn-secondary float-right" type="radio"
                                    onClick={() => this.show_in_eur()}> Show in €
                            </button>
                        </div>
                    </div>
                    <div>
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Unit. Value</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Total Value</th>
                                <th scope="col">Delete</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.stocks.map(this.each_stock)}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        Total value : {print_total}
                    </div>

                    <div className="btn-toolbar m-2" role="toolbar">
                        <div className="btn-group m-1" role="group" aria-label="First group">
                            <button type="button" className="btn btn-primary"
                                    onClick={() => this.add_stock_state()}>Add
                                Stock
                            </button>
                        </div>
                        <div className="btn-group m-1" role="group">
                            <button type="button" className="btn btn-info"
                                    onClick={() => this.update_total()}>Refresh total
                            </button>
                        </div>
                        <div className="btn-group m-1" role="group">
                            <button type="button" className="btn btn-outline-danger"
                                    onClick={() => this.props.remove(this.props.index)}>Remove
                                portfolio
                            </button>
                        </div>
                        <div className="btn-group m-1" role="group">
                            <button type="button" className="btn btn-outline-danger"
                                    onClick={() => this.remove_all_stock()}>Remove all stocks
                            </button>
                        </div>
                    </div>
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

        this.state = {
            portfolios: portfolios_history,
            current_number_of_portfolio: nb_pf,
        };
    }

    saveMainState() {
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
        if (this.state.current_number_of_portfolio < 10 &&
            this.state.portfolios.includes(document.getElementById("pf_name").value) === false) {
            let newPF = document.getElementById("pf_name").value;
            let tmp_pf = this.state.portfolios;
            tmp_pf.push(newPF);
            let nb_tmp = this.state.current_number_of_portfolio + 1;

            this.setState({
                portfolios: tmp_pf,
                current_number_of_portfolio: nb_tmp
            });

        } else if (this.state.portfolios.includes(document.getElementById("pf_name").value) === true) {
            alert("This name is already used");
        } else {
            alert("You have too much portfolios");
        }
    };


    removePortfolio = (index) => {
        let tmp_pf = this.state.portfolios;
        localStorage.removeItem(tmp_pf[index]);
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
            <div className="container-fluid">
                <div className="row m-2">
                    <input id="pf_name" type="text"/>
                    <button type="button" className="btn btn-primary" onClick={() => this.addPortfolio()}>Create new
                        portfolio
                    </button>
                </div>
                <div className="row">
                    {
                        this.state.portfolios.map(this.eachPortfolios)
                    }
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

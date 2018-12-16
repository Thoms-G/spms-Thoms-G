import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

const base_url_iex = "https://api.iextrading.com/1.0";

class Stock extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.symbol}</td>
                <td>{this.props.unit_price}</td>
                <td>{this.props.shares}</td>
                <td>{this.props.unit_price * this.props.shares}</td>
                <td>
                    <button type="button" className="btn btn-warning btn-sm"
                            onClick={() => this.props.deleteStock(this.props.index)}>Delete
                    </button>
                </td>
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
            current_stocks: 0,
            reload: 0
        };
        this.update_stocks();
    }

    savePortfolioState() {
        this.update_stocks();
        localStorage.setItem("portfolios" + this.props.index, JSON.stringify(this.state));
    }

    componentDidMount() {
        this.setState(JSON.parse(localStorage.getItem("portfolios" + this.props.index)));
        this.setState({reload: 0});

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
                    let u_price = Number(data);

                    tmp_stocks.push({symbol: stocks_sym, shares: stock_shares, unit_price: u_price});

                    this.setState({
                        addingStock: false,
                        stocks: tmp_stocks,
                        current_stocks: tmp_current_stocks
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

    update_stocks() {
        if (this.state.reload === 1) {
            console.log("dans update");
            let tmp_stocks = this.state.stocks;
            console.log(tmp_stocks);
            let i = 0;
            for (let stock of tmp_stocks) {
                console.log("dans for");
                this.update_stocks_bis(stock, i);
                i++;
            }
            this.setState({reload: 0})
        }
    }


    async update_stocks_bis(stock, index) {
        let price_url = base_url_iex + '/stock/' + stock.symbol + '/price';
        const res = await fetch(price_url);
        const u_price = Number(await res.json());
        console.log(u_price);
        let tmp_stocks = this.state.stocks;
        tmp_stocks[index].unit_price = u_price + 1;
        this.setState({stocks: tmp_stocks});
        //return u_price;
    }

    each_stock = (stock, i) => {
        //this.update_stocks_bis(stock, i);
        return (
            <Stock symbol={stock.symbol} shares={stock.shares} unit_price={stock.unit_price}
                   key={i} index={i}
                   deleteStock={(i) => this.remove_stock(i)}/>)


    };

    render_stock_form() {
        return (
            <div className="card mt-3 ml-auto col-lg-6 col-sm-12">

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
        )
    }

    render_portfolio() {
        let tmp_stocks = this.state.stocks;
        let tmp_total_value = 0;

        for (let stock of tmp_stocks) {
            tmp_total_value += stock.unit_price * stock.shares;
        }

        return (

            <div className="card mt-3 col-lg-6 col-sm-12">

                <h3 className="card-header">{this.props.name}</h3>
                <div className="container">
                    <div className="btn-group btn-group-toggle m-1" data-toggle="buttons">
                        <button className="btn btn-secondary float-right" type="radio"> Show in $</button>
                        <button className="btn btn-secondary float-right" type="radio"> Show in €</button>
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
                    Total value : {tmp_total_value}
                </div>

                <div className="btn-toolbar m-2" role="toolbar">
                    <div className="btn-group m-1" role="group" aria-label="First group">
                        <button type="button" className="btn btn-primary"
                                onClick={() => this.add_stock_state()}>Add
                            Stock
                        </button>
                    </div>
                    <div className="btn-group m-1" role="group">
                        <button type="button" className="btn btn-info">Perf. Graph</button>
                    </div>
                    <div className="btn-group m-1" role="group">
                        <button type="button" className="btn btn-outline-danger"
                                onClick={() => this.props.remove(this.props.index)}>Remove
                            portfolio
                        </button>
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

import React from 'react';
import Chart from 'chart.js/auto';
import * as Covalent from './Covalent.js';
import * as Bootstrap from 'bootstrap';


class App extends React.Component {
  /*
    Pools
    Decouper en components
    Creer module charts
    Placeholder loading
    Meilleure gestion des query params
    Perf gros dex (pancake, quick)
  */

  constructor(props) {
    console.log('constructor');
    super(props);
    this.state = {
      allChains: '',
      currentChain: '',
      allDexes: '',
      currentDex: '', 
      currentDexPools: ''
    };

    this.handleClick = this.handleClick.bind(this);
    this.onChangeChain = this.onChangeChain.bind(this);
    this.onChangeDex = this.onChangeDex.bind(this);
    this.onShowPoolsTab = this.onShowPoolsTab.bind(this);

    console.log('bootstrap', Bootstrap);
  }

  async onShowPoolsTab (event) {
    console.log('show pools tab !!', event.target) // newly activated tab
    //console.log('show Tab prev', event.relatedTarget) // previous active tab
      let newState = {};
      newState.currentDexPools = await Covalent.getPools(this.state.currentChain.chain_id, this.state.currentDex.data.items[0].dex_name);
      newState.currentPoolPage = 0;
      this.setState(newState);
  }
  
  showTab(id) {
    var triggerEl = document.getElementById(id);
    var tab = Bootstrap.Tab.getInstance(triggerEl);
    tab.show();
  }

  async componentDidMount() {
    console.log('componentDidMount');

    /*var triggerTabList = [].slice.call(document.querySelectorAll('#myTab button'))
    triggerTabList.forEach(function (triggerEl) {
      var tabTrigger = new Bootstrap.Tab(triggerEl)

      triggerEl.addEventListener('click', function (event) {
        event.preventDefault()
        console.log('click tab', event);
        tabTrigger.show()
      })
    })*/

    var tabElList = document.querySelectorAll('button[data-bs-toggle="tab"]')
    tabElList.forEach(function(tabEl) {
      new Bootstrap.Tab(tabEl)
    })


    let poolTabStatus = document.getElementById('pool-tab-status');
    let poolTab = document.getElementById('pools-tab');
    console.log('poolTabStatus', poolTabStatus.value);

    if (poolTabStatus.value == 0) {
      console.log('init Pool Tab event');
      poolTabStatus.value = 1;
      poolTab.addEventListener('show.bs.tab', this.onShowPoolsTab)
      poolTab.addEventListener('hide.bs.tab', function (event) {
        console.log('hide pools tab !!', event.target) // newly activated tab
        //console.log('show Tab prev', event.relatedTarget) // previous active tab
      })
    }




    this.initCharts();
    let initState = {};
    initState.allChains = await this.getMainnetChains();
    initState.currentChain = initState.allChains[0];
    initState.allDexes = await Covalent.getSupportedDexesByChain(initState.currentChain.chain_id);
    initState.currentDex = await Covalent.getDexChartData(initState.currentChain.chain_id, initState.allDexes[0].dex_name);
    //initState.currentDexPools = await Covalent.getPools(initState.currentChain.chain_id, initState.currentDex.data.items[0].dex_name);
    initState.currentDexPools =[];
    initState.currentPoolPage = 0;
    this.setState(initState);
    this.updateCharts(initState.currentDex)
  }

  async onChangeChain(event) {
    console.log('onChangeChain', event.target.value);
    this.showTab('overview-tab');
    let updateState = {};
    updateState.currentChain = this.state.allChains.find(c => c.chain_id === event.target.value);
    updateState.allDexes = await Covalent.getSupportedDexesByChain(updateState.currentChain.chain_id);
    updateState.currentDex = await Covalent.getDexChartData(updateState.currentChain.chain_id, updateState.allDexes[0].dex_name);
    //updateState.currentDexPools = await Covalent.getPools(updateState.currentChain.chain_id, updateState.currentDex.data.items[0].dex_name);
    updateState.currentDexPools =[];
    updateState.currentPoolPage = 0;
    this.setState(updateState);
    this.updateCharts(updateState.currentDex)
  }
  
  async onChangeDex(event) {
    this.showTab('overview-tab');
    console.log('onChangeDex', event.target.value);
    let updateState = {};
    updateState.currentDex = await Covalent.getDexChartData(this.state.currentChain.chain_id, event.target.value);
    //updateState.currentDexPools = await Covalent.getPools(this.state.currentChain.chain_id, updateState.currentDex.data.items[0].dex_name);
    updateState.currentDexPools =[];
    updateState.currentPoolPage = 0;
    this.setState(updateState);
    this.updateCharts(updateState.currentDex);
  }

  async getMainnetChains() {
    let dexes = await Covalent.getSupportedDexes();
    let chains = await Covalent.getAllChains();
    chains = chains.data.items.filter(c => !c.is_testnet);
    return chains.filter(c => dexes.find(d => d.chain_id === c.chain_id));
  }
  
  initCharts() {
    
    const data0 = {
      labels: [],
      datasets: [{
        label: 'Volume 30 days',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [],
      }]
    };
    
    const config0 = {
      type: 'line',
      data: data0,
      options: {}
    };

    let chartVolume;
    try {
      chartVolume = new Chart(document.getElementById('volume-30-days'), config0);
    } catch (e) {
      chartVolume = false;
    }

    const data1 = {
      labels: [],
      datasets: [{
        label: 'Liquidity 30 days',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [],
      }]
    };
    
    const config1 = {
      type: 'line',
      data: data1,
      options: {}
    };

    let chartLiquidity;
    try {
      chartLiquidity = new Chart(document.getElementById('liquidity-30-days'), config1);
    } catch (e) {
      chartLiquidity = false;
    }

    if (chartVolume !== false) {
      console.log('Init chartVolume', chartVolume);
      this.setState({ chartVolume: chartVolume });
    } 
    if (chartLiquidity !== false) {
      console.log('Init chartLiquidity', chartLiquidity);
      this.setState({ chartLiquidity: chartLiquidity });
    } 
  }

  updateCharts(dex) {

    console.log('updateCharts', dex.data.items[0].dex_name);

    let formatDate = d => new Date(d).toISOString().substring(5, 10);
    
    let volumeX = dex.data.items[0].volume_chart_30d.map(v => formatDate(v.dt));
    let volumeY = dex.data.items[0].volume_chart_30d.map(v => v.volume_quote);

    let liquidityX = dex.data.items[0].liquidity_chart_30d.map(l => formatDate(l.dt));
    let liquidityY = dex.data.items[0].liquidity_chart_30d.map(l => l.liquidity_quote);

    this.state.chartVolume.data.labels = volumeX;
    this.state.chartVolume.data.datasets[0].data = volumeY;
    this.state.chartVolume.update();

    this.state.chartLiquidity.data.labels = liquidityX;
    this.state.chartLiquidity.data.datasets[0].data = liquidityY;
    this.state.chartLiquidity.update();
  }
  
  async handleClick(e) {
    e.preventDefault();

    //let chainId = '1';
    let chainId = '56'; // BNB Chain

    let allChains = await Covalent.getAllChains();
    console.log('All chains', allChains);
    
    let allTokens = await Covalent.getAllTokens(chainId);
    console.log('All tokens', allTokens);

    let allDexes = await Covalent.getSupportedDexes();
    console.log('All dexes', allDexes);

    let allDexesByChain = await Covalent.getSupportedDexesByChain(chainId);
    console.log('All dexes by chain', allDexesByChain);

    let currentDex = await Covalent.getDexChartData(chainId, 'sushiswap');
    console.log('Dex data', currentDex);

    let pools = await Covalent.getPools(chainId, 'sushiswap');
    console.log('Pools', pools);

    let tokens = await Covalent.getTokens(chainId, 'sushiswap');
    console.log('Tokens', tokens);
  }

  activePools() {
    let allPools = this.state.currentDexPools;
    if (!allPools || allPools.length === 0) return [];

    console.log('allPools', allPools.data.items);
    //return allPools.data.items.filter(p => p.volume_24h_quote > 0);
    return allPools.data.items;
  }

  async prevPoolPage() {
    if (this.state.currentPoolPage === 0) return;
    let newState = {};
    newState.currentPoolPage = this.state.currentPoolPage - 1;
    newState.currentDexPools = await Covalent.getPools(this.state.currentChain.chain_id, this.state.currentDex.data.items[0].dex_name, newState.currentPoolPage);
    console.log('prevPoolPage', newState);
    this.setState(newState);
  }

  async nextPoolPage() {
    let newState = {};
    newState.currentPoolPage = this.state.currentPoolPage + 1;
    newState.currentDexPools = await Covalent.getPools(this.state.currentChain.chain_id, this.state.currentDex.data.items[0].dex_name, newState.currentPoolPage);
    console.log('nextPoolPage', newState);
    this.setState(newState);
  }


  render() { 
    return (
    <div className="container-fluid">

          <div className="row vh-100">
            <div className="col-2 py-3 bg-dark">
                <a href="/" className="d-flex justify-content-center text-white text-decoration-none">
                  <p className="fs-3">DEX Dashboard</p>
                </a>

                <select id="select-chain" className="form-select" onChange={this.onChangeChain} value={this.state.currentChain && this.state.currentChain.chain_id}>
                  {this.state.allChains && this.state.allChains.map(chain =>
                    <option key={chain.chain_id} value={chain.chain_id}>{chain.label}</option> 
                  )}
                </select>

                <select id="select-dex" className="form-select"  onChange={this.onChangeDex} value={this.state.currentDex && this.state.currentDex.data.items[0].dex_name}>
                  {this.state.allDexes && this.state.allDexes.map(dex =>
                    <option key={dex.dex_name} value={dex.dex_name}>{dex.dex_name}</option> 
                  )}
                </select>

                <button className="btn btn-primary mb-4" type="button" onClick={this.handleClick}>List</button>

            </div> {/* Sidebar */}
            <div className="col-10 py-3 px-4">

              <ul className="nav nav-tabs mt-3 mb-3" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab" aria-controls="overview" aria-selected="true">Overview</button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="pools-tab" data-bs-toggle="tab" data-bs-target="#pools" type="button" role="tab" aria-controls="pools" aria-selected="false">Pools</button>
                </li>
              </ul>
              <div className="tab-content" id="myTabContent">
                {this.state.currentChain && this.state.currentDex &&
                  <p className="fs-4">{this.state.currentChain.label} / {this.state.currentDex.data.items[0].dex_name}</p>
                }
                <div className="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                    <div className="row mb-5">
                      <div className="col-6">
                          <canvas id="volume-30-days"></canvas>
                      </div>
                      <div className="col-6">
                        <canvas id="liquidity-30-days"></canvas>
                      </div>
                  </div>

                  {this.state.currentDex &&
                    <React.Fragment>
                      <table className="table rounded-3 shadow mb-4">
                        <tbody>
                          <tr>
                            <td>total_swaps_24h</td>
                            <td>{this.state.currentDex.data.items[0].total_swaps_24h}</td>
                            <td>total_active_pairs_7d</td>
                            <td>{this.state.currentDex.data.items[0].total_active_pairs_7d}</td>
                          </tr>
                          <tr>
                            <td>total_fees_24h</td>
                            <td>{this.state.currentDex.data.items[0].total_fees_24h}</td>
                            <td>gas_token_price_quote</td>
                            <td>{this.state.currentDex.data.items[0].gas_token_price_quote}</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="small text-end">Updated : {new Date(this.state.currentDex.data.updated_at).toLocaleString()}</p>
                    </React.Fragment>
                  }
                </div>{/* Overview tab */}
                <div className="tab-pane fade" id="pools" role="tabpanel" aria-labelledby="pools-tab">

                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Pool</th>
                        <th scope="col">Total Liquidity</th>
                        <th scope="col">Volume 24H</th>
                        <th scope="col">Swap count 24H</th>
                      </tr>
                    </thead>
                    <tbody>
                    {this.activePools().map((pool, index) =>
                      <tr key={index}>
                      <td>{pool.token_0.contract_ticker_symbol}/{pool.token_1.contract_ticker_symbol}</td>
                      <td>{pool.total_liquidity_quote}</td>
                      <td>{pool.volume_24h_quote}</td>
                      <td>{pool.swap_count_24h}</td>
                    </tr>
                    )}
                    </tbody>
                  </table>
                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" className="btn btn-light" onClick={() => this.prevPoolPage()}>Prev</button>
                    <button type="button" className="btn btn-light" onClick={() => this.nextPoolPage()}>Next</button>
                  </div>
                  <input id="pool-tab-status" type="hidden" value="0" />
                </div>{/* Pool tab */}
              </div>{/* Tab content */}

            </div> {/* Content */}
          </div>

    </div>
    );
  }
}

export default App;

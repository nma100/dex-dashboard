import React from 'react';
import Chart from 'chart.js/auto';
import * as Covalent from './Covalent.js';
import * as Bootstrap from 'bootstrap';


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allChains: '',
      currentChain: '',
      allDexes: '',
      currentDex: '', 
      currentDexPools: ''
    };

    this.onChangeChain = this.onChangeChain.bind(this);
    this.onChangeDex = this.onChangeDex.bind(this);
    this.onShowPoolsTab = this.onShowPoolsTab.bind(this);
  }

  showLoadModal(show) {
    var myModalEl = document.querySelector('#load-modal');
    var modal = Bootstrap.Modal.getOrCreateInstance(myModalEl);

    if (show) modal.show();
    else modal.hide();
  }

  initTabs() {
    
    var tabElList = document.querySelectorAll('button[data-bs-toggle="tab"]')
    tabElList.forEach(function(tabEl) {
      new Bootstrap.Tab(tabEl)
    })

    let poolTabStatus = document.getElementById('pool-tab-status');
    let poolTab = document.getElementById('pools-tab');

    if (poolTabStatus.value == 0) {
      poolTabStatus.value = 1;
      poolTab.addEventListener('show.bs.tab', this.onShowPoolsTab);
    }
  }

  async onShowPoolsTab (event) {
      this.blurTags(true);
      this.showSpin(true);
      let newState = {};
      newState.currentDexPools = await Covalent.getPools(this.state.currentChain.chain_id, this.state.currentDex.data.items[0].dex_name);
      newState.currentPoolPage = 0;
      this.setState(() => { 
        this.blurTags(false);
        this.showSpin(false);
        return newState;
      });
  }

  blurTags(blur) {
    if (blur)
      document.getElementById('tab-content-panel').classList.add('opacity-25')
    else 
      document.getElementById('tab-content-panel').classList.remove('opacity-25')
  }

  blurCombos(blur) {
    if (blur) {
      document.getElementById('select-chain').classList.add('opacity-25');
      document.getElementById('select-dex').classList.add('opacity-25');
    } else  {
      document.getElementById('select-chain').classList.remove('opacity-25');
      document.getElementById('select-dex').classList.remove('opacity-25');
    }
  }
  
  showTab(id) {
    var triggerEl = document.getElementById(id);
    var tab = Bootstrap.Tab.getInstance(triggerEl);
    tab.show();
  }

  showSpin(spin) {
    if (spin)
      document.getElementById('spinner').classList.remove('d-none')
    else 
      document.getElementById('spinner').classList.add('d-none')
  }

  async componentDidMount() {
    this.showLoadModal(true);
    this.showSpin(true);
    this.blurTags(true);
    this.initTabs();
    this.initCharts();
    let initState = {};
    initState.allChains = await this.getMainnetChains();
    initState.currentChain = initState.allChains[0];
    initState.allDexes = await Covalent.getSupportedDexesByChain(initState.currentChain.chain_id);
    initState.currentDex = await Covalent.getDexChartData(initState.currentChain.chain_id, initState.allDexes[0].dex_name);
    initState.currentDexPools =[];
    initState.currentPoolPage = 0;
    this.setState(initState);
    this.updateCharts(initState.currentDex);
    this.showSpin(false);
    this.blurTags(false);
    this.showLoadModal(false);
  }

  async onChangeChain(event) {
    this.blurCombos(true);    
    this.blurTags(true);    
    this.showSpin(true);
    this.showTab('overview-tab');
    let updateState = {};
    updateState.currentChain = this.state.allChains.find(c => c.chain_id === event.target.value);
    updateState.allDexes = await Covalent.getSupportedDexesByChain(updateState.currentChain.chain_id);
    updateState.currentDex = await Covalent.getDexChartData(updateState.currentChain.chain_id, updateState.allDexes[0].dex_name);
    updateState.currentDexPools =[];
    updateState.currentPoolPage = 0;
    this.setState(updateState);
    this.updateCharts(updateState.currentDex);
    this.blurCombos(false);    
    this.blurTags(false);
    this.showSpin(false);
  }
  
  async onChangeDex(event) {
    this.blurCombos(true);    
    this.blurTags(true);
    this.showSpin(true);
    this.showTab('overview-tab');
    let updateState = {};
    updateState.currentDex = await Covalent.getDexChartData(this.state.currentChain.chain_id, event.target.value);
    updateState.currentDexPools =[];
    updateState.currentPoolPage = 0;
    this.setState(updateState);
    this.updateCharts(updateState.currentDex);
    this.blurCombos(false);
    this.blurTags(false);
    this.showSpin(false);
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
      this.setState({ chartVolume: chartVolume });
    } 
    if (chartLiquidity !== false) {
      this.setState({ chartLiquidity: chartLiquidity });
    } 
  }

  updateCharts(dex) {

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

  activePools() {
    let allPools = this.state.currentDexPools;
    if (!allPools || allPools.length === 0) return [];
    return allPools.data.items;
  }

  async prevPoolPage() {
    if (this.state.currentPoolPage === 0) return;
    this.blurTags(true);
    let newState = {};
    newState.currentPoolPage = this.state.currentPoolPage - 1;
    newState.currentDexPools = await Covalent.getPools(this.state.currentChain.chain_id, this.state.currentDex.data.items[0].dex_name, newState.currentPoolPage);
    this.setState(() => {
      this.blurTags(false);
      return newState;
    });
  }

  async nextPoolPage() {
    this.blurTags(true);
    let newState = {};
    newState.currentPoolPage = this.state.currentPoolPage + 1;
    newState.currentDexPools = await Covalent.getPools(this.state.currentChain.chain_id, this.state.currentDex.data.items[0].dex_name, newState.currentPoolPage);
    this.setState(() => {
      this.blurTags(false);
      return newState;
    });
  }


  render() { 
    return (
    <div className="container-fluid">

          <div className="row vh-100">
            <div className="col-2 py-3 position-relative bg-dark shadow">
                <a href="/" className="d-flex justify-content-center text-white text-decoration-none">
                  <div id="title" className="text-center">DEX Dashboard</div>
                </a>
                <hr className='text-light my-4'/>

                <div className="mb-4">
                  <label htmlFor="select-chain" className="form-label text-light">Blockchain</label>
                  <select id="select-chain" className="form-select" onChange={this.onChangeChain} value={this.state.currentChain && this.state.currentChain.chain_id}>
                    {this.state.allChains && this.state.allChains.map(chain =>
                      <option key={chain.chain_id} value={chain.chain_id}>{chain.label}</option> 
                    )}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="select-dex" className="form-label text-light">Exchange</label>
                  <select id="select-dex" className="form-select"  onChange={this.onChangeDex} value={this.state.currentDex && this.state.currentDex.data.items[0].dex_name}>
                    {this.state.allDexes && this.state.allDexes.map(dex =>
                      <option key={dex.dex_name} value={dex.dex_name}>{dex.dex_name}</option> 
                    )}
                  </select>
                </div>

                <div id="spinner" className="text-center d-none">
                  <div className="spinner-border text-light mt-4" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>

                <div className='text-light text-center position-absolute bottom-0 start-50 translate-middle'>
                    <div className='fs-5'>Powered By</div>
                    <a className='fs-4 text-reset' href='https://www.covalenthq.com/'>Covalent</a>
                </div>

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
              <div id="tab-content-panel" className="tab-content opacity-25" >
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
                      <div className="table-responsive">
                      <table className="table rounded-3 shadow-sm mb-4">
                        <tbody>
                          <tr>
                            <td className='table-light w-25'>Total swaps 24H</td>
                            <td className='text-muted'>{this.state.currentDex.data.items[0].total_swaps_24h}</td>
                            <td className='table-light w-25'>Total active pairs 7D</td>
                            <td className='text-muted'>{this.state.currentDex.data.items[0].total_active_pairs_7d}</td>
                          </tr>
                          <tr>
                            <td className='table-light w-25'>Total fees 24H</td>
                            <td className='text-muted'>{this.state.currentDex.data.items[0].total_fees_24h}</td>
                            <td className='table-light w-25'>Gas token price quote</td>
                            <td className='text-muted'>{this.state.currentDex.data.items[0].gas_token_price_quote}</td>
                          </tr>
                        </tbody>
                      </table>
                      </div>
                      <p className="position-absolute bottom-0 end-0 px-4 small">Updated : {new Date(this.state.currentDex.data.updated_at).toLocaleString()}</p>
                    </React.Fragment>
                  }
                </div>{/* Overview tab */}
                <div className="tab-pane fade" id="pools" role="tabpanel" aria-labelledby="pools-tab">
                  <div className="table-responsive">
                  <table className="table table-striped table-sm">
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
                  </div>

                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" className="btn btn-light" onClick={() => this.prevPoolPage()}><i className="bi bi-caret-left-fill"></i> Prev</button>
                    <button type="button" className="btn btn-light" onClick={() => this.nextPoolPage()}>Next <i className="bi bi-caret-right-fill"></i></button>
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

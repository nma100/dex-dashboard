import React from 'react';
import Chart from 'chart.js/auto';
import * as Covalent from './Covalent.js';

const ETHEREUM = '1';

class App extends React.Component {
  /*
    TODO Pb dans les combo selected value par correcte
    Gestion du chart update. Voir doc API  
  */

  constructor(props) {
    super(props);
    this.state = {
      chainId: '',
      allChains: '',
      allDexes: '',
      dexData : ''
    };

    this.handleClick = this.handleClick.bind(this);
    this.onChangeChain = this.onChangeChain.bind(this);
    this.onChangeDex = this.onChangeDex.bind(this);
  }
  
  async componentDidMount() {
    console.log('componentDidMount');
    let initState = {};
    initState.allChains = await this.getMainnetChains();
    initState.chainId = ETHEREUM;
    initState.allDexes = await Covalent.getSupportedDexesByChain(initState.chainId);
    initState.dexData = await Covalent.getDexChartData(initState.chainId, initState.allDexes[0].dex_name);
    this.setState(initState);
    this.initCharts(initState.dexData)
  }

  async onChangeChain(event) {
    console.log('onChangeChain', event.target.value);
    let updateState = {};
    updateState.chainId = event.target.value;
    updateState.allDexes = await Covalent.getSupportedDexesByChain(updateState.chainId);
    updateState.dexData = await Covalent.getDexChartData(updateState.chainId, updateState.allDexes[0].dex_name);
    this.setState(updateState);
    this.initCharts(updateState.dexData)
  }
  
  async onChangeDex(event) {
    console.log('onChangeDex', event.target.value);
    let dexData = await Covalent.getDexChartData(this.state.chainId, event.target.value);
    this.setState({ dexData: dexData });
    this.initCharts(dexData)
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

    let dexData = await Covalent.getDexChartData(chainId, 'sushiswap');
    console.log('Dex data', dexData);

    let pools = await Covalent.getPools(chainId, 'sushiswap');
    console.log('Pools', pools);

    let tokens = await Covalent.getTokens(chainId, 'sushiswap');
    console.log('Tokens', tokens);
  }

  async getMainnetChains() {
    let dexes = await Covalent.getSupportedDexes();
    let chains = await Covalent.getAllChains();
    chains = chains.data.items.filter(c => !c.is_testnet);
    return chains.filter(c => dexes.find(d => d.chain_id === c.chain_id));
  }

  
  initCharts(dexData) {

    console.log('initCharts', dexData);

    let volumeX = dexData.data.items[0].volume_chart_30d.map(v => new Date(v.dt).toISOString().substring(5, 10));
    let volumeY = dexData.data.items[0].volume_chart_30d.map(v => v.volume_quote);
    console.log('volumeTab', volumeY);

    let liquidityX = dexData.data.items[0].liquidity_chart_30d.map(l => new Date(l.dt).toISOString().substring(5, 10));
    let liquidityY = dexData.data.items[0].liquidity_chart_30d.map(l => l.liquidity_quote);
    console.log('liquidityTab', liquidityY);

    const data0 = {
      labels: volumeX,
      datasets: [{
        label: 'Volume 30 days',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: volumeY,
      }]
    };
    
    const config0 = {
      type: 'line',
      data: data0,
      options: {}
    };
    let chartVolume = new Chart(document.getElementById('volume-30-days'), config0);
    console.log(chartVolume);

    const data1 = {
      labels: liquidityX,
      datasets: [{
        label: 'Liquidity 30 days',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: liquidityY,
      }]
    };
    
    const config = {
      type: 'line',
      data: data1,
      options: {}
    };
    let chartLiquidity = new Chart(document.getElementById('liquidity-30-days'), config);
    console.log(chartLiquidity);
  }


  render() { 
    return (
    <div className="container p-4">

        <button className="btn btn-primary mb-4" type="button" onClick={this.handleClick}>List</button>

        <select id="select-chain" className="form-select"  onChange={this.onChangeChain}>
          {this.state.allChains && this.state.allChains.map(chain =>
            <option key={chain.chain_id} value={chain.chain_id}>{chain.label}</option> 
          )}
        </select>
        <br/>

        <select id="select-dex" className="form-select"  onChange={this.onChangeDex}>
          {this.state.allDexes && this.state.allDexes.map(dex =>
            <option key={dex.dex_name} value={dex.dex_name}>{dex.dex_name}</option> 
          )}
        </select>
        <br/>

        <div className="row mb-5">
          <div className="col">
              <canvas id="volume-30-days"></canvas>
          </div>
          <div className="col">
            <canvas id="liquidity-30-days"></canvas>
          </div>
        </div>


        {this.state.dexData &&
        <table className="table rounded-3 shadow">
          <tbody>
            <tr>
              <td>total_active_pairs_7d</td>
              <td>{this.state.dexData.data.items[0].total_active_pairs_7d}</td>
              <td>total_swaps_24h</td>
              <td>{this.state.dexData.data.items[0].total_swaps_24h}</td>
            </tr>
            <tr>
              <td>total_fees_24h</td>
              <td>{this.state.dexData.data.items[0].total_fees_24h}</td>
              <td>gas_token_price_quote</td>
              <td>{this.state.dexData.data.items[0].gas_token_price_quote}</td>
            </tr>
            <tr>
              <td colSpan={4}><span className="me-2">updated_at :</span> {new Date(this.state.dexData.data.updated_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        }

    </div>
    );
  }
}

export default App;

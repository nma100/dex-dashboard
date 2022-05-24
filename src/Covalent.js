const API_KEY = 'ckey_87690792ec0347b4b17b0cfe961';
const API_URL = 'https://api.covalenthq.com/v1';

function getAllChains() {
    return callApi('/chains');
}

function getSupportedDexes() {
    return callApi('/xy=k/supported_dexes').then(dexes => dexes.data.items);
}

function getSupportedDexesByChain(chainId) {
    return getSupportedDexes().then(dexes => dexes.filter(dex => dex.chain_id === chainId));
}

function getDexChartData(chainId, dexname) {
    return callApi(`/${chainId}/xy=k/${dexname}/ecosystem`);
}

function getPools(chainId, dexname) {
    return callApi(`/${chainId}/xy=k/${dexname}/pools`);
}

function getAllTokens(chainId) {
    return callApi(`/${chainId}/tokens/tokenlists/all`);
}

function getTokens(chainId, dexname) {
    return callApi(`/${chainId}/xy=k/${dexname}/tokens`);
}

function callApi(endpoint) {

  return new Promise((resolve, reject) => {

    let onLoad = function (e) {
        let response = JSON.parse(e.currentTarget.responseText);
        resolve(response);
    };

    let onError = function (e) {
        console.error('API Error', e);
        reject(e);
    };

    let xhr = new XMLHttpRequest(endpoint, onLoad);
    xhr.open("GET", API_URL +  endpoint + '/?key=' + API_KEY);
    xhr.addEventListener('load', onLoad);
    xhr.addEventListener('error', onError);
    xhr.send();
  });
}

export { getAllChains, getSupportedDexes, getSupportedDexesByChain, getDexChartData, getPools, getAllTokens, getTokens };
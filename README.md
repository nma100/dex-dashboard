# DEX Dashboard

This app is a dashboard of major decentralized exchanges.

The user chooses a blockchain and a dex from the left menu.
The application presents the information of this exchange : Volume, liquidity, number of swaps, list of pairs, etc.

##How the app works

The application relies on the [Covalent API](https://www.covalenthq.com) to fetch exchanges data. This API provides visibility into many blockchains data : tokens, NFTs, transactions and more.

Others frameworks used on this application are :
* [React](https://reactjs.org/) : JavaScript library developed by Facebook which facilitates the creation of single-page web applications 
* [Bootstrap](https://getbootstrap.com/) :  CSS framework for responsive front-end development.

## Build

Install dependencies :
```
npm install
```

Create production build :
```
npm run build
```

Start development server :
```
npm start
```
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import Web4 from '@cryptonteam/web4';
import { output, error } from '~/utils/index';
import { ERC20 } from './abis';

let web4;
let web3Wallet;
let userAddress;
let chainId;

export const fetchContractData = async (method, abi, address, params) => {
  try {
    const Contract = new web3Wallet.eth.Contract(abi, address);
    return await Contract.methods[method].apply(this, params).call();
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const getUserAddress = () => userAddress;

export const createInst = async (address) => {
  const abs = web4.getContractAbstraction(ERC20);
  return await abs.getInstance(address);
};

export const connectWallet = async () => {
  try {
    const { ethereum } = window; // ethereum - metamask
    web3Wallet = new Web3(ethereum); // init web3
    if (await web3Wallet.eth.getCoinbase() === null) { // проверяем подключен ли metamask
      await ethereum.enable(); // подключить metamask
    }
    userAddress = await web3Wallet.eth.getCoinbase(); // получить адрес пользователя
    chainId = await web3Wallet.eth.net.getId(); // запись сети
    if (+chainId !== 4) {
      // TODO switch network request
      return console.log(500, 'current site work in rinkeby', chainId);
    }

    web4 = new Web4();
    await web4.setProvider(ethereum, userAddress);

    return output();
  } catch (err) {
    return error(500, 'err', err);
  }
};

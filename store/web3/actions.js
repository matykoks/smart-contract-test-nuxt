import BigNumber from 'bignumber.js';
import { connectWallet, createInst, getUserAddress } from '../../utils/web3';

export default {
  async connectWallet({ commit }) {
    const r = await connectWallet();
    if (!r.ok) {
      console.log(r);
      return;
    }
    commit('setIsConnected', true);
    commit('setUserAddress', getUserAddress());
  },
  async createInstance({ commit }, payload) {
    return await createInst(payload);
  },
  async setToken({ commit }, payload) {
    const instance = await createInst(payload);
    const symbol = await instance.symbol();
    const decimalsToken = await instance.decimals();
    const decimals = new BigNumber(decimalsToken).toString();
    let balance = await instance.balanceOf(getUserAddress());
    balance = new BigNumber(balance).shiftedBy(-decimals).toString();
    const token = {
      symbol,
      decimals,
      balance,
      instance,
    };
    commit('setToken', token);
  },
  async setCurrentBalance({ commit, state }, payload) {
    const { tokens } = state;
    commit('setBalance', Object.keys(tokens).length ? tokens[payload].balance : 0);
  },
  async setCurrentAllowance({ commit, state }, payload) {
    const { userAddress, tokens } = state;
    const { symbol, recipientAddress } = payload;
    if (!recipientAddress.length || !Object.keys(tokens).length) {
      commit('setAllowance', 0);
      return;
    }
    let allowance = 0;
    let success = false;
    try {
      allowance = await tokens[symbol].instance.allowance(userAddress, recipientAddress);
      success = true;
    } catch (e) {
      console.log(e);
    }
    commit('setAllowance', success ? allowance : 0);
  },
  async approve({ commit, state }, payload) {
    const { tokens } = state;
    const { symbol, recipientAddress, amount } = payload;
    let success = false;
    try {
      await tokens[symbol].instance.approve(recipientAddress, amount);
      success = true;
    } catch (e) {
      console.log(e);
    }
    commit('setAllowance', success ? amount : 0);
  },
  async transfer({ commit, state }, payload) {
    const { tokens } = state;
    const { symbol, recipientAddress, amount } = payload;
    const decimals = Number(tokens[symbol].decimals);
    let success = false;
    try {
      const transferAmount = new BigNumber(amount).shiftedBy(decimals).toString();
      await tokens[symbol].instance.transfer(recipientAddress, transferAmount);
      success = true;
    } catch (e) {
      console.log(e);
    }
    if (success) {
      tokens[symbol].balance -= amount;
      commit('setBalance', tokens[symbol].balance);
    }
  },
};

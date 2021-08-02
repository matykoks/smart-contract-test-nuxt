export default {
  setIsConnected(state, payload) {
    state.isConnected = payload;
  },
  setUserAddress(state, payload) {
    state.userAddress = payload;
  },
  setToken(state, payload) {
    const { symbol } = payload;
    state.tokens[symbol] = payload;
  },
  setBalance(state, payload) {
    state.balance = payload;
  },
  setAllowance(state, payload) {
    state.allowance = payload;
  },
};

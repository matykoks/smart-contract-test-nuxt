<template>
  <div class="main">
    <div class="main__body">
      <b-button
        @click="connect"
      >
        Connect Wallet
      </b-button>

      <label for="amount">Amount</label>
      <input
        id="amount"
        v-model="amountInput"
        placeholder="amount"
      >

      <b-dropdown
        v-model="currencyValue"
        :text="currencies[currencyValue]"
      >
        <template v-for="(item,i) in currencies">
          <b-dropdown-item
            :key="i"
            @click="currencyValue = i;"
          >
            {{ item }}
          </b-dropdown-item>
        </template>
      </b-dropdown>

      <label for="recipient">Address (recipient)</label>
      <input
        id="recipient"
        v-model="recipientInput"
        placeholder="recipient"
        @input="changeAllowance"
      >

      <span>Balance: {{ balance }} {{ currencies[currencyValue] }}</span>
      <span>Allowance: {{ allowance }}</span>

      <b-button
        @click="approve"
      >
        Approve
      </b-button>
      <b-button
        @click="transfer"
      >
        Transfer
      </b-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  data() {
    return {
      amountInput: 0.0,
      recipientInput: '',
      currencyValue: 0,
      currencies: [],
      symbol: '',
    };
  },
  computed: {
    ...mapGetters({
      isConnected: 'web3/getIsConnected',
      userAddress: 'web3/getUserAddress',
      tokens: 'web3/getTokens',
      balance: 'web3/getBalance',
      allowance: 'web3/getAllowance',
    }),
  },
  watch: {
    async currencyValue() {
      this.symbol = this.currencies[this.currencyValue];
      await this.$store.dispatch('web3/setCurrentBalance', this.symbol);
      const recipientAddress = this.recipientInput;
      await this.$store.dispatch('web3/setCurrentAllowance', { symbol: this.symbol, recipientAddress });
    },
  },
  mounted() {
    this.symbol = this.currencies.length ? this.currencies[this.currencyValue] : '';
  },
  methods: {
    async connect() {
      this.currencies = [];
      await this.$store.dispatch('web3/connectWallet');
      if (this.isConnected) {
        await this.$store.dispatch('web3/setToken', process.env.DLD);
        await this.$store.dispatch('web3/setToken', process.env.testUSDT);

        Object.keys(this.tokens).forEach((key) => {
          this.currencies.push(key);
        });
        this.symbol = this.currencies[this.currencyValue];
        await this.$store.dispatch('web3/setCurrentBalance', this.symbol);
        await this.$store.dispatch('web3/setCurrentAllowance', { symbol: this.symbol, recipientAddress: this.recipientInput });
      }
    },
    async changeAllowance() {
      if (!this.isConnected) return;
      const recipientAddress = this.recipientInput;
      await this.$store.dispatch('web3/setCurrentAllowance', { symbol: this.symbol, recipientAddress });
    },
    async approve() {
      const recipientAddress = this.recipientInput;
      const amount = Number(this.amountInput);
      await this.$store.dispatch('web3/approve', { symbol: this.symbol, recipientAddress, amount });
    },
    async transfer() {
      const recipientAddress = this.recipientInput;
      const amount = Number(this.amountInput);
      await this.$store.dispatch('web3/transfer', { symbol: this.symbol, recipientAddress, amount });
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  &__body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 20px;

    max-width: 700px;
  }
}
</style>

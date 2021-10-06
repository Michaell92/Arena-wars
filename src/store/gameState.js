import defaultState from './state.js';

export default {
  state() {
    // Card collection
    return { ...defaultState };
  },
  mutations: {
    resetDefault(state) {
      Object.assign(state, defaultState);
    },
  },
  actions: {
    resetState({ commit }) {
      commit('resetDefault');
    },
  },
  getters: {
    allCards(state) {
      return state.cards;
    },
    shuffledCards() {
      // shuffle
    },
  },
};

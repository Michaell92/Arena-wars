import { createStore } from 'vuex';

import gameState from './gameState.js';

const store = createStore({
  modules: {
    gameState,
  },
});

export default store;

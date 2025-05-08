import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isOnlineMode: false,
    destination: {
      path: '',
      level: -1,
    },
    isMatching: false,
    isMatched: false,
    roomId: '',
    myScore: -1,
    enemyUsername: '',
  },

  getters: {
  },

  mutations: {
    setOnlineMode(state, value) {
      state.isOnlineMode = value;
    },

    setRoomId(state, id) { state.roomId = id; },

    setDestination(state, destination) {
      state.destination.path = destination.path;
      state.destination.level = destination.level;
    },

    setIsMatching(state, value) {
      state.isMatching = value;
    },

    setIsMatched(state, value) {
      state.isMatched = value;
    },

    setRoomId(state, value) {
      state.roomId = value;
    },

    setEnemyUsername(state, value) {
      state.enemyUsername = value;
    },

    setMyScore(state, value) {
      state.myScore = value;
    }
  },

  actions: {
  },

  modules: {
  }
})

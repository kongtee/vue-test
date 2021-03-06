import Vue from 'vue';
import Vuex from 'vuex';
import menus from './menu';

Vue.use(Vuex);

const state = {
};

const mutations = {
};

const actions = {
};

const getters = {
    layout: state => state.layout,
    menuItems: state => state.menus.items
};

const modules = {
    menus
};

export default new Vuex.Store({
    strict: true,
    actions,
    getters,
    modules,
    state,
    mutations
});

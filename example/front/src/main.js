import Vue from 'vue'
import App from './App.vue'
import router from './router'

// WS plugin
import WsPlugin from './../../../index'
Vue.use(WsPlugin, { adonisWS: window.adonis.Ws })
// end WS plugin

import ElementUI from 'element-ui';

Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

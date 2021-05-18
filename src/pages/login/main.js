import Vue from 'vue' ;

import {Input, Button, Message} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue' ;
Vue.use(Input);
Vue.use(Button);
Vue.prototype.$message = Message;
import '@/libs/init.js';

Vue.config.productionTip = false ;

new Vue({
// router,
//  store,
  render: h => h(App)
}).$mount('#app');

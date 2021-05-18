import Vue from 'vue';
import VueRouter from 'vue-router';
import {arrRoutes} from '@/libs/menuLists';

Vue.use(VueRouter);

let  routes = [];
arrRoutes.forEach(item =>{
    routes.push({
        path: '/'+ item.name,
        name: item.name,
        component: () => import('@/pages/home/'+item.path+'/index.vue')
    });
});
const routes2 =[
    {
       path: '/',
       redirect: '/index' 
    }
];
routes = routes.concat(routes2);
const router = new VueRouter({
    routes
});
export default router;
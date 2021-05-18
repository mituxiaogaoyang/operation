/*
 * @Author: renfeng 
 * @Date: 2020-07-16 13:45:13 
 * @Last Modified by: renfeng
 * @Last Modified time: 2020-10-26 09:46:25
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {getItems} from '@/apis/api';

Vue.use(Vuex);

export default  new Vuex.Store({
  state: {
    itemCurrent: '', // 当前选中的项目
    itemsAll:[], // 所有项目
    pageSizes: [10, 20, 30, 40],
    pageSize: 10,
  },
  mutations: {
    updateItem(state, val){
      state. itemCurrent = val;
      sessionStorage.setItem('itemSelected',val);
    },
    getAllItems(state, val){
      state.itemsAll = val;
    },
    changePageSize(state, val){
      state.pageSize = val;
    }
  },
  actions: {
    getAllItemsAsync(context){
      getItems(sessionStorage.getItem('username')).then(res =>{
        
        if(res.length>0){
          const items = res.sort((a,b) => {return new Date(a.startTime)-new Date(b.startTime);});
          console.log(items);
          context.commit('getAllItems', items);
          const itemLocal = sessionStorage.getItem('itemSelected');
          
          if(typeof itemLocal === 'object'){ //无本地选中项目
            context.commit('updateItem', items[items.length-1].id);
          }else{
            const itemIds = items.map(item => item.id);
            let projectId ;
            
            if(itemIds.includes(Number(itemLocal))){
              projectId = Number(itemLocal);
              
            }else{
              projectId = items[items.length-1].id;
            }
            context.commit('updateItem', projectId);
            
          }
          
        }
        
      });
    
    }
  }
});

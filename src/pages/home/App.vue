<template>
  <div id="app">
    <div class="container_left">
      <div class="logo">设备运维平台</div>
      <el-menu :default-active="navCurr" class="el-menu-vertical-demo" router>
        <template v-for="list in menuLists">
          <el-submenu v-if="list.children" :key="list.name" :index="list.name">
            <template slot="title">
              <i :class="list.icon"></i>
              <span>{{list.label}}</span>
            </template>
            <el-menu-item
              :index="item.name"
              :key="item.name"
              v-for="item in list.children"
            >{{item.label}}</el-menu-item>
          </el-submenu>
          <el-menu-item v-else :index="list.name" :key="list.name">
            <i :class="list.icon"></i>
            <span slot="title">{{list.label}}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
    <div class="container_top">
      <el-select v-model="itemCurrent2" placeholder="请选择" class="item_select" @change="changeItem">
        <el-option
          v-for="item in itemsAll"
          :key="item.id"
          :label="item.projectName"
          class="option_list"
          :value="item.id"
        ></el-option>
      </el-select>
      <div class="user_box">
        <el-dropdown @command="handleCommand">
          <div class="el-dropdown-link">
            <div class="avatar">
              <img src="@/assets/user.png" alt="用户头像" />
            </div>
            <div class="name">{{username}}</div>
            <i class="el-icon-caret-bottom icon"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="loginout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="container_main">
      <el-tabs v-model="navCurr" type="card" @tab-remove="removeTab" @tab-click="clickTab">
        <el-tab-pane
          v-for="item in navTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
          :closable="item.name != 'index'"
        ></el-tab-pane>
      </el-tabs>
      <div class="route_box">
        <keep-alive :include="arrCaches">
          <router-view />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import { menuLists, arrRoutes } from '@/libs/menuLists.js';
import {loginOut} from '@/apis/login';
export default {
  components: {},
  data() {
    return {
      menuLists,
      navTabs: [],
      navCurr: "",
      arrCaches: ["index"],
      itemCurrent2:''
    };
  },
  created() {
    this.navTabs = arrRoutes.slice(0, 1);
    this.navCurr = arrRoutes[0].name;
    this.$store.dispatch("getAllItemsAsync");
  },
  mounted() {
    if(!this.username){
      location.href = location.protocol + '//' + location.host + '/login.html';  
    }
  },
  computed: {
    itemsAll() {
      return this.$store.state.itemsAll;
    },
    itemCurrent(){
     return this.$store.state.itemCurrent;  
    },
    username(){
      return sessionStorage.getItem('maintenanceName');
    }
  },
  watch: {
    "$route.name"(nV) {
      //菜单导航或者刷新触发      
      const navsTab = this.navTabs.map((item) => item.name);
      if (nV !== "index" && !navsTab.includes(nV)) {
        const obj = arrRoutes.find((item) => item.name === nV);
        this.navTabs.push(obj);
      }
      this.navCurr = nV;
    },
    navTabs(nV) {
      this.arrCaches = nV.map((item) => item.name);
    },
    itemCurrent(nV){
      this.itemCurrent2 = nV;
    }
  },
  methods: {
    removeTab(name) {
      const tabs = this.navTabs;
      let activeName = this.navCurr;
      if (name === activeName) {
        tabs.forEach((item, i) => {
          if (item.name === name) {
            let nextTab = tabs[i + 1] || tabs[i - 1];
            if (nextTab) {
              activeName = nextTab.name;
            } else {
              activeName = arrRoutes[0].name;
            }
          }
        });
        this.$router.push({ name: activeName });
      }
      this.navCurr = activeName;
      this.navTabs = tabs.filter((tab) => tab.name !== name);
    },
    changeItem(){
       this.$store.commit('updateItem', this.itemCurrent2);
    },
    clickTab(instance) {
      this.$router.push({ name: instance.name });
    },
    handleCommand(command) {
      if(command==='loginout'){
        this.$confirm('确定退出系统?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          loginOut();
          //location.href = location.protocol + '//' + location.host + '/login.html';   
        }).catch(() => {   
        });   
      }
    },
  },
};
</script>
<style lang="less">
@import "@/assets/less/cover.less";
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  background: url(../../assets/imgs/index/bg_top.png) fixed no-repeat;
  background-size: 100% auto;
  color: #858585;
}
.container_left {
  float: left;
  width: 12rem;
  background-color: #fff;
  min-height: 100%;
  i{
    background-position: center center;
    background-size: 100% 100%;
    display: inline-block;
    margin-right: 0.2rem;
  }
  .logo {
    height: 4rem;
    line-height: 4rem;
    background: #7095ff;
    font-style: italic;
    text-align: center;
    font-weight: 600;
    color: #fff;
    font-size: 1.1rem;
  }
  .dashboard{
    background-image: url(../../assets/imgs/index/dashboard.png);
    width:0.8rem;
    height:0.88rem;
  }
  .monitorPoint{
    background-image: url(../../assets/imgs/index/monitorPoint.png);
    width:0.8rem;
    height:0.88rem;
  }
  .device{
    background-image: url(../../assets/imgs/index/device.png);
    width:0.8rem;
    height:0.88rem;
  }
  .firmware{
    background-image: url(../../assets/imgs/index/firmware.png);
    width:0.8rem;
    height:0.88rem;
  }
  .el-menu-item.is-active{
    .dashboard{
      background-image: url(../../assets/imgs/index/dashboard2.png);
    }
    .monitorPoint{
      background-image: url(../../assets/imgs/index/monitorPoint2.png);
    }
    
    .firmware{
      background-image: url(../../assets/imgs/index/firmware2.png);
    }
    
  }
  .el-menu .el-submenu.is-active{
    .device{
      background-image: url(../../assets/imgs/index/device2.png);
    }
  }
}
.container_top {
  height: 5%;
  position: fixed;
  z-index: 3;
  right: 1.5rem;
  top: 0.8rem;
  .item_select {
    float: left;
    margin-right: 0.8rem;
    width: 13rem;
    .el-input__inner {
      height: 2.4rem;
      line-height: 2.4rem;
      border-radius: 1.2rem;
      background: transparent;
      color: #fff;
      border-color: rgba(255, 255, 255, 0.5);
    }
    .el-input {
      font-size: 0.9rem;
      .el-select__caret {
        color: rgba(255, 255, 255, 0.8);
      }
      &.is-focus {
        .el-input__inner {
          border-color: #fff;
        }
      }
    }
  }
  .user_box {
    float: left;
    padding: 0.4rem 0.8rem 0.4rem 0.5rem;
    background-color: rgba(255, 255, 255, 0.6);
    width: 6.3rem;
    border-radius: 1.2rem;
    position: relative;
    cursor: pointer;
    .avatar {
      display: inline-block;
      margin-right: 0.6rem;
      vertical-align: middle;
      width: 1.6rem;
      height: 1.6rem;
      overflow: hidden;
      img {
        width: 100%;
      }
    }
    .name {
      display: inline-block;
      color: #4977fc;
      vertical-align: middle;
      width: 3.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
    .icon {
      position: absolute;
      right: -0.6rem;
      color: #2059ff;
      top: 0.5rem;
    }
  }
}
.container_main {
  margin: 0 1.2rem 0 13.2rem;
  padding-top: 5vh;
  .route_box {
    font-size: 0.7rem;
    height: 83vh;
    background-color: #fff;
    padding: 1rem;
    > div {
      height: 100%;
    }
    .table_containner {
      box-shadow: 0 0 0.3rem #ccc;
      padding: 0 0.8rem;
      margin-top: 0.5rem;
      height: calc(100% - 3.7rem);
      .title_table {
        font-size: 0.8rem;
        color: #999;
        padding: 0.8rem 0 0.4rem;
      }
    }
  }
}
.option_list {
  height: 1.8rem;
  line-height: 1.8rem;
  font-size: 0.75rem;
}
</style>

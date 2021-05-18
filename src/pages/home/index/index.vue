<template>
  <div class="index_page">
    <div class="statistic_box">
      <div class="device_statistic"> 
        <div class="devices_amount">
          <div class="number">{{deviceAmount}}</div>
          <div class="word">设备接入总数(台)</div>
        </div>
        <div class="devices_list" :style="{width:5+Math.ceil(deviceTypesAmount.length/2)*5+'rem'}">
          <div class="list" v-for="list in deviceTypesAmount" :key="list.name" :style="{width:Math.floor(100/Math.ceil(deviceTypesAmount.length/2))+'%'}">
            <div class="number">{{list.amount}}</div>
            <div class="word">{{list.name}}</div>
          </div>
          <div class="list" :style="{width:Math.floor(100/Math.ceil(deviceTypesAmount.length/2))+'%'}"></div>
        </div>
      </div>
      <div class="data_statistic">
        <div class="box_one">
          <div class="number">{{fourEightEquipNum}}</div>
          <div class="word">48小时无数据</div>
        </div>
        <div class="box_one">
          <div class="number">{{sevenTwoEquipNum}}</div>
          <div class="word">72小时无数据</div>
        </div>
      </div>
    </div>
    <div class="table_containner table_containner2">
      <div class="title_table">隐患点列表</div>
      <div class="toolbar_box">
        <tool-bar :isSearchFloat=true @changeArea="getTableByArea" @seachByWord="seachByWord" placeholder="隐患点名称或编号"></tool-bar>
      </div>
      <table-operation :loadingTable="loadingTable" :tableData="tableData" :fields= "fields" :currentPage="currentPage" :totalSize="totalSize" @changePage="getTableData"></table-operation>
    </div>
  </div>
</template>

<script>
import toolBar from '@/components/toolbar.vue';
import tableOperation from '@/components/tableOperation.vue';
import {classifyDevice, getYhds} from '@/apis/api';
const deviceTypes = [
  {label: 'GNSS设备',val: 'gnssJcEquipNum'},
  {label: '雨量设备',val: 'ylEquipNum'},
  {label: '裂缝设备',val: 'lxwyEquipNum'},
  {label: '泥位设备',val: 'titlWireAccNum'},
  {label: '崩塌设备',val: 'gnssJzEquipNum'},
  {label: '其他设备',val: 'broadEquipNum'},
];
export default {
  name: "index",
  components: {toolBar, tableOperation},
  data() {
    return {
      deviceAmount: '',
      fourEightEquipNum: '',
      sevenTwoEquipNum: '',
      deviceTypesAmount: [],
      fields:[
        {label: '编号',prop: 'hiddenCode',minWidth: 5},
        {label: '隐患点名称',prop: 'hiddenName',minWidth: 6},
        {label: '地理位置',prop: 'position',minWidth: 7},
        {label: '经度',prop: 'lng',minWidth: 4},
        {label: '纬度',prop: 'lat',minWidth: 4},
        {label: '监测点个数',prop: 'monitorStationNum',minWidth: 5},
        {label: '责任人',prop: 'responsibleName',minWidth: 3},
        {label: '联系方式',prop: 'mobile',minWidth: 5},
      ],
      tableData:[],
      totalSize:0,
      currentPage:1,
      loadingTable: true
    };
  },
  mounted() {
    this.getDeviceAmount();
    this.getTableData();
    this.query = {};
  },
  watch: {
    itemCurrent(nV){
      this.getDeviceAmount();
      this.getTableData(1);
    },
    pageSize(nV){
      this.getTableData(1);
    }
  },
  computed: {
    itemCurrent(){
      return this.$store.state.itemCurrent;
    },
    pageSize(){
      return this.$store.state.pageSize;
    }
  },
  methods: {
    getDeviceAmount() {
      this.deviceTypesAmount = [];
      classifyDevice(this.itemCurrent).then(res =>{
        this.deviceTypesAmount = [];
        this.deviceAmount = res['设备总数'];
        this.fourEightEquipNum =res['48小时无数据'];
        this.sevenTwoEquipNum = res['72小时无数据'];
        const obj = {...res};
        delete obj['设备总数'];
        delete obj['48小时无数据'];
        delete obj['72小时无数据'];
        for(let i in obj){
          this.deviceTypesAmount.push({
            amount: obj[i],
            name: i,
          });
        }
      });
      
    },
    getTableData(num, query){
      this.loadingTable = true;
      typeof query ==='object' && Object.assign(this.query,query);
      num = typeof num=== 'number' ? num : this.currentPage;
      this.currentPage = num;
      const obj ={
        ...this.query,
        projectId:this.itemCurrent,
        currentPage: num,
        pageSize: this.pageSize,

      };
      this.itemCurrent&&getYhds(obj).then(res =>{
        this.loadingTable = false;
        this.tableData = res.items;
        this.totalSize = res.totalRecords;
        
      });
    },
    getTableByArea(areaInfo){
      this.getTableData(1,areaInfo);
    },
    seachByWord(word){
      this.getTableData(1,{key: word});
    }
  }
};
</script>

<style lang='less'>
.statistic_box{
  @height: 9rem;
  @colorBlue: #4977FC;
  display: flex;
  padding-bottom: 0.6rem;
  .device_statistic{
    display: flex;
    align-items:  center;
    height: @height;
    text-align: center;
    box-shadow: 0 0 0.3rem #D3D7DD;
    border-radius: 0.3rem;
    position: relative;
    margin-right:1rem;
    .number{
      color: @colorBlue;
      margin-bottom:0.4rem;
      border-radius:1rem;
      background-color: rgba(73, 119, 252, .08);
      display: inline-block;
      padding:0.3rem 0.6rem;
      font-weight: bold;
    }
    .devices_amount {
      width:10rem;
      &::after{
        content: '';
        display: block;
        position: absolute;
        top:1.5rem;
        height:6rem;
        left:10rem;
        width:0.1rem;
        background-color: #f0f0f0;
      }
      .number{
        font-size: 1.4rem;
        padding:0.4rem 1rem;
        border-radius: 1.2rem;
        margin-bottom: 0.7rem;
      }
    }
    .devices_list{
      width:26rem;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      font-size: 0.6rem;
      .list{
        width:21%;
        margin: 0.5rem 0;
      }
      .number{
        font-size: 0.9rem;
      }
    }
  }
  .data_statistic{
    display: flex;
    align-items:  center;
    width:20rem;
    height: @height;
    text-align: center;
    box-shadow: 0 0 0.3rem #D3D7DD;
    border-radius: 0.3rem;
    position: relative;
    .box_one{
      width:10rem;
    }
    .number{
      font-size: 1.4rem;
      padding:0.4rem 1rem;
      border-radius: 1.2rem;
      margin-bottom: 0.7rem;
      color: @colorBlue;
      background-color: rgba(73, 119, 252, .08);
      display: inline-block;
      font-weight: bold;
    }
    &::after{
      content: '';
      display: block;
      position: absolute;
      top:1.5rem;
      height:6rem;
      left:10rem;
      width:0.1rem;
      background-color: #f0f0f0;
    }
  }
}
.table_containner{
  .toolbar_box{
    padding:0 1.5rem;
  }
}
.table_containner2{
  height: calc(100% - 10.7rem)!important;
}
</style>
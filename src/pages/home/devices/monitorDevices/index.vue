<template>
  <div class='monitor_device'>
    <tool-bar  @changeArea="getTableByArea" @seachByWord="seachByWord" placeholder="设备编号、设备名称、隐患点名称、监测点名称">
      <template v-slot:searchBefore >
        <div class="list_slot">
          <div class="label">状态：</div>
          <el-select v-model="statusOnline" placeholder="请选择" clearable @change="getDeviceData">
            <el-option
              v-for="item in statusDic"
              :key="item.dicCode"
              :label="item.dicName"
              :value="item.dicCode"
            ></el-option>
          </el-select>
        </div>
      </template>
      <template v-slot:btnBox>
        <el-button type="primary" icon="el-icon-plus" @click="addDevice">添加设备</el-button>
        <file-import name="设备" pathImport="equipInfo/import" @downTemplate="downTemplate" @importSuccess="getDeviceData"></file-import>
      </template>
    </tool-bar>
    <div class="table_containner">
      <div class="title_table">监测设备列表</div>
      <table-operation :tableData="tableData" :fields="fields" :operates="operates" :loadingTable="loadingTable"
        :currentPage="currentPage"
        :totalSize="totalSize"
        @changePage="getDeviceData"
      ></table-operation>
    </div>
    <!-- 添加设备 -->
    <pop-box
      :title="isDeviceAdd?'添加监测设备':'编辑监测设备'"
      :popShow="editFormVisible"
      @submit="submitEditForm"
      @cancel="cancelEditForm"
      :isSubmiting="loadingSubmit"
    >
      <el-form
        :model="deviceInfo"
        :rules="deviceRules"
        ref="editForm"
        label-width="6.2rem"
        class="form_gateway"
      >
        <div class="input_lists2">
          <el-form-item label="设备名称：" prop="equipName">
            <el-input v-model="deviceInfo.equipName"></el-input>
          </el-form-item>
          <el-form-item label="设备编号：" prop="equipCode">
            <el-input v-model="deviceInfo.equipCode" :disabled="!isDeviceAdd"></el-input>
          </el-form-item>
          <el-form-item label="设备型号：" prop="model">
            <el-input v-model="deviceInfo.model"></el-input>
          </el-form-item>
          <el-form-item label="设备类型：" prop="equipType">
            <el-select v-model="deviceInfo.equipType" placeholder="请选择">
              <el-option
                v-for="item in deviceTypes"
                :key="item.dicCode"
                :label="item.dicName"
                :value="item.dicCode"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属监测点：" prop="monitorCode">
            <el-select v-model="deviceInfo.monitorCode" placeholder="请选择" clearable>
              <el-option
                v-for="item in monitors"
                :key="item.monitorCode"
                :label="item.monitorName"
                :value="item.monitorCode"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属网关：" prop="gatewayCode">
            <el-select v-model="deviceInfo.gatewayCode" placeholder="请选择" clearable>
              <el-option
                v-for="item in gateways"
                :key="item.gatewayCode"
                :label="item.gatewayName"
                :value="item.gatewayCode"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据流编号：" prop="dataFlow" class="item_double is-required" v-if="requireDataflow">
            <el-select v-model="dataFlow1" placeholder="请选择">
              <el-option
                v-for="item in dataFlow1Dict"
                :key="item.dicName"
                :label="item.dicName"
                :value="item.dicName"
              ></el-option>
            </el-select>
            <span class="line_short">-</span>
            <el-select v-model="dataFlow2" placeholder="请选择">
              <el-option
                v-for="item in 20"
                :key="item+12"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="初始值：" prop="initValue">
            <el-input v-model="deviceInfo.initValue"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </pop-box>
    <detail-pop :popShow="detailVisible" :detailInfo= "detailInfo"  @cancel="cancelDetail"></detail-pop>
    <!-- 数据流 -->
    <pop-box
      title="数据流"
      :popShow="dataStreamVisible"
      widthBox="60%"
      :includeFooter="false"
      @cancel="cancelStreamPop"
    >
      <div class="time_select">
        <div class="label">选择日期：</div>
        <el-date-picker
          v-model="timeSearch"
          type="daterange"
          range-separator="~"
          value-format="yyyy-MM-dd"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="showDataStream"
        ></el-date-picker>
      </div>
      <div class="table_data">
        <table-operation v-if="equipType2 ===2" :tableData="tableDataMonitor" :fields="fieldsData2" :currentPage="pageOrder.currentPage" :totalSize="pageOrder.totalSize" @changePage="showDataStream"></table-operation>
        <table-operation v-else-if="equipType2 ===3" :tableData="tableDataMonitor" :fields="fieldsData3" :currentPage="pageOrder.currentPage" :totalSize="pageOrder.totalSize" @changePage="showDataStream"></table-operation>
        <table-operation v-else-if="equipType2 ===8" :tableData="tableDataMonitor" :fields="fieldsData4" :currentPage="pageOrder.currentPage" :totalSize="pageOrder.totalSize" @changePage="showDataStream"></table-operation>
        <table-operation v-else :tableData="tableDataMonitor" :fields="fieldsData" :currentPage="pageOrder.currentPage" :totalSize="pageOrder.totalSize" @changePage="showDataStream"></table-operation>
      </div>
    </pop-box>
  </div>
</template>

<script>
  import tableOperation from "@/components/tableOperation.vue";
  import toolBar from "@/components/toolbar.vue";
  import popBox from "@/components/popbox.vue";
  import detailPop from "@/components/detailPop.vue";
  import fileImport from '@/components/fileImport.vue';
  import * as apis from "@/apis/api";
  import { stampToYMD } from "@/libs/init";
  function requiredItem(msg = "该项不能为空") {
    const obj = { required: true, message: msg };
    return obj;
  }
  const status = [
    {label: '在线', value: 1},
    {label: '离线', value: 0},
  ];
  let idEdit;
  export default {
    name: "monitorDevices",
    components: {
      tableOperation,
      toolBar,
      popBox,
      fileImport,
      detailPop
    },
    computed: {
      itemCurrent() {
        return this.$store.state.itemCurrent;
      },
      pageSize() {
        return this.$store.state.pageSize;
      }
    },
    watch: {
      itemCurrent(nV) {
        this.getDeviceData(1);
        this.getGateways();
        this.getMonitors();
      },
      pageSize(nV) {
        this.getDeviceData(1);
      },
      'deviceInfo.equipType'(nV){
        const num = nV?Number(nV):0 ;
        if(num=== 1 || num===2 ){
          this.requireDataflow = true;
        }else{
          this.requireDataflow = false;
        }
      }
    },
    data () {
      return {
        statusOnline: '',
        status,
        statusDic:[],
        tableData: [],
        currentPage: 1,
        totalSize: 0,
        fields:[
          {
            prop: "equipCode",
            label: "设备编号",
            minWidth: 4,
          },
          {
            prop: "equipName",
            label: "设备名称",
            minWidth: 5,
          },
          {
            prop: "hiddenName",
            label: "所属隐患点",
            minWidth: 5,
          },
          {
            prop: "monitorName",
            label: "所属监测点",
            minWidth: 5,
          },
          {
            prop: "gatewayName",
            label: "所属网关",
            minWidth: 5,
          },
          {
            prop: "equipTypeName",
            label: "类型",
            minWidth: 4,
          },
          {
            prop: "latestDataTime",
            label: "最新数据时间",
            minWidth: 6,
          },
          {
            prop: "equipmentStateName",
            label: "数据状态",
            minWidth: 4,
          },
        ],
        operates:[
          {name: '数据流', method: this.showDataStream},
          {name: '编辑', method: this.editDevice},
          {name: "详情",method: this.showDetail},   
          {name: '删除', method: this.deleteDevice},
        ],
        fieldsData: [ //1-雨量
          {
            prop: "collectTime",
            label: "最新数据时间",
            minWidth: 4,
          },
          {
            prop: "jcValue",
            label: "监测值",
            minWidth: 4,
          },
        ],
        fieldsData2: [//2-拉线位移
          {
            prop: "collectTime",
            label: "最新数据时间",
            minWidth: 4,
          },
          {
            prop: "jcValue",
            label: "监测值",
            minWidth: 4,
          }
        ],
        fieldsData3: [ //3--监测站
          {
            prop: "collectTime",
            label: "最新数据时间",
            minWidth: 5,
          },
          {
            prop: "shift2d",
            label: "shift2d",
            minWidth: 4,
          },
          {
            prop: "shift3d",
            label: "shift3d",
            minWidth: 4,
          },
          {
            prop: "xshift",
            label: "xshift",
            minWidth: 4,
          },
          {
            prop: "yshift",
            label: "yshift",
            minWidth: 4,
          },
          {
            prop: "zshift",
            label: "zshift",
            minWidth: 4,
          },
        ],
        fieldsData4: [//8--多功能设备
          {
            prop: "collectTime",
            label: "最新数据时间",
            minWidth: 4,
          },
          {
            label: "倾角X轴值",
            prop: "tilt_x_cur",
            minWidth: 4,
          },
          {
            label: "倾角Y轴值",
            prop: "tilt_y_cur",
            minWidth: 4,
          },
          {
            label: "倾角Z轴值",
            prop: "tilt_z_cur",
            minWidth: 4,
          },
          {
            label: "拉线当前值",
            prop: "wire_cur",
            minWidth: 4,
          },
          {
            label: "加速度X值",
            prop: "acc_x_cur",
            minWidth: 4,
          },
          {
            label: "加速度Y值",
            prop: "acc_y_cur",
            minWidth: 4,
          },
          {
            label: "加速度Z值",
            prop: "acc_z_cur",
            minWidth: 4,
          },
        ],
        tableDataMonitor: [],
        pageOrder: {
          currentPage: 1,
          totalSize: 0,
        },
        editFormVisible:false,
        detailVisible: false,
        isDeviceAdd: true,
        deviceInfo:{
          equipCode:'',
          equipName:'',
          equipType:'',
          monitorCode: '',
          gatewayCode:'',
          initValue:'',
          model:'',
        },
        detailInfo:[
          {label:'equipName', name: '设备名称', v:''},
          {label:'equipCode', name: '设备编号', v:''},
          {label:'equipTypeName', name: '设备类型', v:''},
          {label:'monitorName', name: '所属监测点', v:''},
          {label:'gatewayName', name: '所属网关', v:''},
          {label:'model', name: '设备型号', v:''},
          {label:'dataFlowCode', name: '数据流编号', v:''},
          {label:'initValue', name: '初始值', v:''},
        ],
        deviceRules: {
          equipName: [{ min:1,max:32, message: '输入字符不能超过32位', trigger: 'blur' },requiredItem()],
          equipCode: [{ min:2,max:20, message: '输入字符在2-20位之间', trigger: 'blur' },requiredItem()],
          equipType: [requiredItem()],
        },
        deviceTypes:[],
        gateways: [],
        dataStreamVisible: false,
        timeSearch:[],
        dataFlow1Dict: [],
        dataFlow1:'',
        dataFlow2:'',
        loadingSubmit: false,
        loadingTable: true,
        equipType2:0,
        monitors:[],
        requireDataflow: false
      };
    },
    created(){
      this.getOnlineDict();
      this.getDeviceTypesDict();
      this.getDataFlowDict();
      
      const day7ToMsec = 7 * 24 * 60 * 60 * 1000;
      const msecNow = Date.now();
      const timeStart = msecNow - day7ToMsec;
      const timeEnd = new Date();
      this.timeSearch = [stampToYMD(timeStart), stampToYMD(msecNow)];
    },
    mounted () {
      this.query = {};
      this.getDeviceData();
      this.getGateways();
      this.getMonitors();
    },
    methods: {
      getDeviceData(num, query) {
        this.loadingTable = true;
        typeof query === "object" && Object.assign(this.query, query);
        num = typeof num === "number" ? num : this.currentPage;
        this.currentPage = num;
        const obj = {
          ...this.query,
          projectId: this.itemCurrent,
          currentPage: num,
          pageSize: this.pageSize,
          equipStateType: this.statusOnline
        };
        this.itemCurrent&&apis.getEquips(obj).then((res) => {
          this.loadingTable = false;
          res.items.map(item =>{
            if(Number(item.equipType) === 4){
              item.cantOperate = true;
              item.equipmentStateName = '---';
            }
          });
          this.tableData = res.items;
          this.totalSize = res.totalRecords;
        });
      },
      getTableByArea(info) {
        this.areaInfo = info;
        this.getDeviceData(1, info);
      },
      seachByWord(word) {
        this.searchWord = word;
        this.getDeviceData(1, { key: word });
      },
      getMonitors(){
        const obj = {
          projectId: this.itemCurrent,
          currentPage: 1,
          pageSize: -1,
        };
        apis.getJcds(obj).then((res) => {
          this.monitors = res.items;
        });
      },
      getOnlineDict(){
        apis.getDict('SB_DATA_STATUS').then(res =>{
          this.statusDic = res;
        });
      },
      getDataFlowDict(){
        apis.getDict('DATA_FLOW_TYPE').then(res =>{
          this.dataFlow1Dict = res;
        });
      },
      getDeviceTypesDict(){
        apis.getDict('JCSB_TYPE').then(res =>{
          const codeExclude = [5,6,7];
          this.deviceTypes = res.filter(item => !codeExclude.includes(Number(item.dicCode)));
        });
      },
      getGateways(){
        const obj = {
          projectId: this.itemCurrent,
          currentPage: 1,
          pageSize: -1,
        };
        apis.getGateways(obj).then((res) => {
          this.gateways = res.items;
        });
      },
      addDevice(){
        this.editFormVisible = true;
        this.isDeviceAdd = true;
      },
      showDataStream(obj){ 
        this.dataStreamVisible = true;
        const begin = this.timeSearch ? this.timeSearch[0]+ ' 00:00:00' : null;
        const end = this.timeSearch ? this.timeSearch[1]+ ' 23:59:59' : null;
        if (obj && typeof obj === "object"&& obj.equipCode) {
          this.equipCode2 = obj.equipCode;
          this.equipType2 = obj.equipType;
          this.pageOrder.currentPage = 1;
        } else if (typeof obj === "number") {
          this.pageOrder.currentPage = obj;
        }
        const params ={
          begin,
          end,
          equipCode: this.equipCode2 ,
          equipType: this.equipType2,
          currentPage: this.pageOrder.currentPage,
          pageSize: this.pageSize,
        };
        apis.getEquipData(params).then(res =>{
          this.tableDataMonitor = res.items;
          this.pageOrder.totalSize = res.totalRecords;
        });
      },
      editDevice(obj){
        this.isDeviceAdd = false;
        idEdit = obj.id;
        apis.getEquipDetail(idEdit).then((res) => {
          this.editFormVisible = true;
          for (let k in this.deviceInfo) {
            this.deviceInfo[k] = res[k];
            if(k === 'equipType'){
              this.deviceInfo[k] = res[k]+'';
            }
          }
          if(res['dataFlowCode']){
            const flow = res['dataFlowCode'].split('_');
            this.dataFlow1 = flow[0];
            this.dataFlow2 = flow[1];
          }
          
        });
      },
      showDetail(obj) {
        apis.getEquipDetail(obj.id).then((res) => {
          this.detailVisible = true;
          for (let item of this.detailInfo) {
            if(res[item.label] || res[item.label] ===0){
              item.v = res[item.label] ;
            }else{
              item.v = '暂无';
            }
          }
        });
      },
      deleteDevice(obj){
        this.$confirm("确认删除该监测设备?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            apis.deleteEquip(obj.id).then((res) => {
              this.$message.success("删除成功");
              this.getDeviceData();
            });
          })
          .catch(() => {});
      },
      submitEditForm(){
        this.$refs["editForm"].validate((valid) => {
          if (valid) {
            this.loadingSubmit = true;
            if(this.requireDataflow){
              if(!this.dataFlow1 || !this.dataFlow2){
                this.$message.warning('数据流编号不能为空');
                this.loadingSubmit = false;
                return false;
              }
              const dataFlowCode = this.dataFlow1 +'_' +this.dataFlow2;
              Object.assign(this.deviceInfo,{dataFlowCode});
            }else{
              this.deviceInfo.dataFlowCode = '';
            }
            
            if (this.isDeviceAdd) {
              apis.addEquip({...this.deviceInfo,createProjectId: this.itemCurrent}).then((res) => {
                this.loadingSubmit = false;
                this.editFormVisible = false;
                this.$message.success("监测设备添加成功");
                this.getDeviceData();
              }).catch(err =>{
                this.loadingSubmit = false;
              });
            } else {
              apis.updateEquip({ ...this.deviceInfo, id: idEdit ,createProjectId: this.itemCurrent})
                .then((res) => {
                  this.loadingSubmit = false;
                  this.editFormVisible = false;
                  this.$message.success("监测设备修改成功");
                  this.getDeviceData();
                }).catch(err =>{
                this.loadingSubmit = false;
              });
            }
          } else {
            return false;
          }
        });
      },
      cancelEditForm(){
        this.$refs["editForm"].resetFields();
        this.editFormVisible = false;
        for(let k in this.deviceInfo){
          this.deviceInfo[k] = '';
        }
        this.dataFlow1 = '';
        this.dataFlow2 = '';
        this.loadingSubmit = false;
      },
      cancelDetail(){
        this.detailVisible = false;
      },
      cancelStreamPop(){
        this.dataStreamVisible = false;
      },
      downTemplate(){
        apis.getEquipTemplate(this.itemCurrent).then(res =>{
          this.$message.success('下载成功');
        });
      },
    },
  };
</script>

<style lang='less' scoped>
.input_lists2{
  margin:1rem  0.8rem 0.6rem  0.3rem;
  .el-select{
    display: block;
  }
  .item_double{
    .el-select{
      display: inline-block;
      width:42%;
    }
    .line_short{
      color: #ccc;
      font-size: 1rem;
      padding:0 0.2rem;
    }
  }
}
.time_select {
  font-size: 0.75rem;
  display: inline-block;
  margin: 1rem;
  .label {
    display: inline-block;
    font-weight: bold;
  }
}
.table_data{
  height:21rem;
}
</style>
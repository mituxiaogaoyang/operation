<template>
  <div class='firmware'>
    <tool-bar :includeArea=false  @seachByWord="seachByWord" placeholder="固件名称、设备型号、生产厂商">
      <template v-slot:searchBefore>
        <div class="list_slot">
          <div class="label">固件类型：</div>
          <el-select v-model="firwareType" placeholder="请选择" @change="getFirmwareData" clearable>
            <el-option
              v-for="item in firwareTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </template>
      <template v-slot:btnBox>
        <el-button @click="showLog">下发记录</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="addFirmware">上传固件</el-button>
      </template>
    </tool-bar>
    <div class="table_containner">
      <div class="title_table">固件列表</div>
      <table-operation :tableData="tableData" :fields="fields" :operates="operates"
        :loadingTable="loadingTable"
        :currentPage="currentPage"
        :totalSize="totalSize"
        @changePage="getFirmwareData"
      ></table-operation>
    </div>
    <!-- 上传固件 -->
    <pop-box
      :title="isFirmwareAdd?'上传固件':'修改固件'"
      :popShow="editFormVisible"
      @submit="submitEditForm"
      @cancel="cancelEditForm"
      :isSubmiting='loadingSubmit'
    >
      <el-form
        :model="firmwareInfo"
        :rules="firmwareRules"
        ref="editForm"
        label-width="6rem"
        class="form_gateway"
      >
        <div class="input_lists">
          <el-form-item label="固件名称：" prop="firwareName">
            <el-input v-model="firmwareInfo.firwareName"></el-input>
          </el-form-item>
          <el-form-item label="固件类型：" prop="firwareType">
            <el-select v-model="firmwareInfo.firwareType" placeholder="请选择">
              <el-option
                v-for="item in firwareTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="固件版本：" prop="firwareVersion">
            <el-input v-model="firmwareInfo.firwareVersion"></el-input>
          </el-form-item>
          <el-form-item label="生产厂商：" prop="manufacturer">
            <el-input v-model="firmwareInfo.manufacturer"></el-input>
          </el-form-item>
          <el-form-item label="设备型号：" prop="model">
            <el-input v-model="firmwareInfo.model"></el-input>
          </el-form-item>
          <el-form-item label="文件浏览：" prop="attachId" class="is-required">
            <el-upload
              class="upload-demo"
              :action="apiPath + 'firware/upload'"
              :limit="1"
              :headers="{access_token: accessToken}"
              :on-preview="downloadFile"
              :on-remove ="deleteFile"
              :on-exceed ="uploadExceed"
              :before-remove="beforeRemove"
              :before-upload="beforeUploadFile"
              :on-success="handleImportSuccess"
              :file-list="firmwareFileList">
              <el-button class="el-icon-upload2">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </div>
      </el-form>
    </pop-box>
    <detail-pop :popShow="detailVisible" :detailInfo= "detailInfo"  @cancel="cancelDetail">
      <div class="list">
        <div class="label">文件浏览：</div>
        <div class="value"><el-button type="text" @click="downloadFile({url:fileInfo.attachUrl})">{{fileInfo.attachName}}</el-button></div>
      </div>
    </detail-pop>
    <!--下发到设备 -->
    <pop-box
      title="下发到设备"
      widthBox= "66%"
      :popShow="deviceVisible"
      @submit="submitDevice"
      @cancel="cancelDevice"
      class="pop_toDevice"
      :isSubmiting='loadingUpgrade'
    >
      <div class="to_device">
        <div class="tool_bar">
          <div class="list_search">
            <el-input placeholder="请输入生产厂商、设备型号、隐患点名称、监测点名称、设备名称、设备编号" v-model="searchText" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="sendToDevice(searchText)"></el-button>
            </el-input>
          </div>
        </div>
        <el-table
          ref="multipleTable"
          :loading="loadingDeviceTable"
          :data="tableDevice"
          max-height= 400
          @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            align= "center"
            label="全选"
            min-width="2">
          </el-table-column>
          <el-table-column align= "center" type="index" label="序号" width="80"></el-table-column>

          <template>
            <el-table-column align= "center" :prop="list.prop" :label="list.label" :min-width="list.minWidth" v-for="list in fieldsDeviceGateway" :key="list.prop" show-overflow-tooltip></el-table-column>
          </template>
          
        </el-table>
      </div>
    </pop-box>
    <!-- 下发记录 -->
    <pop-box
      title="下发记录"
      :popShow="logVisible"
      widthBox="60%"
      :includeFooter="false"
      @cancel="cancelLogPop"
    >
      <div class="form_table">
        <div class="tool_bar">
          <div class="list_select">
            <div class="label">选择日期：</div>
            <el-date-picker
              v-model="timeSearch"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="showLog"
            ></el-date-picker>
          </div>
        </div>
        <table-operation :tableData="tableDataLog" :fields="logFields"
          :currentPage="pageLog.currentPage"
          :totalSize="pageLog.totalSize"
          @changePage="showLog"
        ></table-operation>
      </div>
    </pop-box>
  </div>
</template>

<script>
  import tableOperation from "@/components/tableOperation.vue";
  import toolBar from "@/components/toolbar.vue";
  import popBox from "@/components/popbox.vue";
  import detailPop from "@/components/detailPop.vue";
  import * as apis from "@/apis/api";
  import {refreshToken} from "@/apis/http";
  import { stampToYMD } from "@/libs/init";
  const status = [
    {label: '在线', value: 1},
    {label: '离线', value: 0},
  ];
  const firwareTypes =[
    {label: 'GNSS固件', value: '3'},
    {label: '广播固件', value: '5'},
    {label: 'RTU固件', value: '6'}
  ];
  function requiredItem(msg = "该项不能为空") {
    const obj = { required: true, message: msg };
    return obj;
  }
  let idEdit;
  export default {
    name: "firmware",
    components: {
      tableOperation,
      toolBar,
      popBox,
      detailPop
    },
    data () {
      return {
        apiPath: apis.apiPath,
        accessToken:'',
        firwareType: '',
        status,
        firwareTypes,
        tableData:[],
        fields: [
          {
            prop: "firwareName",
            label: "固件名称",
            minWidth: 4,
          },
          {
            prop: "firwareTypeName",
            label: "固件类型",
            minWidth: 4,
          },
          {
            prop: "model",
            label: "设备型号",
            minWidth: 4,
          },
          {
            prop: "manufacturer",
            label: "生产厂商",
            minWidth: 5,
          },
          {
            prop: "createTime",
            label: "上传时间",
            minWidth: 5,
          },
        ],
        operates: [
          {name: '下发到设备', method: this.sendToDevice},
          {name: '编辑', method: this.editFirmware},
          {name: "详情",method: this.showDetail,}, 
          {name: '删除', method: this.deleteFirmware}
        ],
        loadingTable: true,
        currentPage: 1,
        totalSize:0,
        isFirmwareAdd: false,
        firmwareFileList: [],
        editFormVisible: false,
        loadingSubmit: false,
        loadingUpgrade: false,
        firmwareInfo: {
          firwareName: '',
          firwareType: '',
          firwareVersion: '',
          manufacturer: '',
          model: '',
        },
        detailInfo: [
          {label:'firwareName', name: '固件名称', v:''},
          {label:'firwareTypeName', name: '固件类型', v:''},
          {label:'firwareVersion', name: '固件版本', v:''},
          {label:'manufacturer', name: '生产厂商', v:''},
          {label:'model', name: '设备型号', v:''},
        ],
        fileInfo:{ //固件文件信息
          attachId: '',
          attachName: '',
          attachUrl: ''
        },
        firmwareRules: {
          firwareName: [{ min:1,max:32, message: '输入字符不能超过32位', trigger: 'blur' },requiredItem()],
          manufacturer: [requiredItem()],
          firwareType: [requiredItem()],
          model: [requiredItem()],
          firwareVersion: [requiredItem()],
        },
        deviceVisible: false,
        detailVisible: false,
        searchText: '',
        tableDevice: [],
        loadingDeviceTable: true,
        fieldsDeviceGateway: [
          {label:'设备编号', prop: 'equipCode', minWidth:5},
          {label:'设备名称', prop: 'equipName', minWidth:5},
           {label:'所属隐患点', prop: 'hiddenName', minWidth:5},
          {label:'所属监测点', prop: 'monitorName', minWidth:5},
          {label:'生产厂商', prop: 'manufacturer', minWidth:4},
          {label:'设备型号', prop: 'model', minWidth:4},
          {label:'在线状态', prop: 'onLineName', minWidth:4},
        ],
        multipleSelection: [],
        logVisible: false,
        logFields:[
          {
            prop: "firwareName",
            label: "固件名称",
            minWidth: 5,
          },
          
          {
            prop: "firwareTypeName",
            label: "固件类型",
            minWidth: 4,
          },
          {
            prop: "firwareVersion",
            label: "固件版本号",
            minWidth: 5,
          },
          {
            prop: "confirmStateName",
            label: "状态",
            minWidth: 4,
          },
          {
            prop: "sendTime",
            label: "下发时间",
            minWidth: 6,
          }
        ],
        timeSearch: [],
        tableDataLog:[],
        deviceToType:0,
        pageLog: {
          currentPage: 1,
          totalSize: 0,
        },
      };
    },
    computed: {
      pageSize() {
        return this.$store.state.pageSize;
      }
    },
     watch: {
      pageSize(nV) {
        this.getFirmwareData(1);
      }
    },
    created() {
      const day7ToMsec = 7 * 24 * 60 * 60 * 1000;
      const msecNow = Date.now();
      const timeStart = msecNow - day7ToMsec;
      const timeEnd = new Date();
      this.timeSearch = [stampToYMD(timeStart), stampToYMD(msecNow)];
    },
    mounted () {
      this.query = {};
      this.getFirmwareData();
      this.accessToken = sessionStorage.getItem('accessToken');
    },
    methods: {
      getFirmwareData(num, query) {
        this.loadingTable = true;
        typeof query === "object" && Object.assign(this.query, query);
        num = typeof num === "number" ? num : this.currentPage;
        this.currentPage = num;
        const firwareType = this.firwareType?Number(this.firwareType):'';
        const obj = {
          ...this.query,
          currentPage: num,
          pageSize: this.pageSize,
          firwareType,
        };
        apis.getFirmwares(obj).then((res) => {
          this.loadingTable = false;
          this.tableData = res.items;
          this.totalSize = res.totalRecords;
        });
      },
      seachByWord(word) {
        this.getFirmwareData(1, { key: word });
      },
      addFirmware(){
        this.editFormVisible = true;
        this.isFirmwareAdd = true;
      },
      submitEditForm(){
        this.$refs["editForm"].validate((valid) => {
          if (valid) {
            if(!this.fileInfo.attachId){
              this.$message.warning('固件文件不能为空');
              return;
            }
            this.loadingSubmit = true;
            this.firmwareInfo.firwareType = Number(this.firmwareInfo.firwareType);
            if (this.isFirmwareAdd) {
              apis.addFirmware({...this.firmwareInfo, attachId: this.fileInfo.attachId}).then((res) => {
                this.loadingSubmit = false;
                this.editFormVisible = false;
                this.$message.success("固件添加成功");
                this.getFirmwareData();
              });
            } else {
              apis
                .updateFirmware({ ...this.firmwareInfo, id: idEdit, attachId: this.fileInfo.attachId })
                .then((res) => {
                  this.loadingSubmit = false;
                  this.editFormVisible = false;
                  this.$message.success("固件修改成功");
                  this.getFirmwareData();
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
        this.loadingSubmit = false;
        this.firmwareFileList =[];
        for(let k in this.firmwareInfo){
          this.firmwareInfo[k] = '';
        }
        for(let k in this.fileInfo){
          this.fileInfo[k] = '';
        }
      },
      sendToDevice(obj){
        this.deviceVisible = true;
        this.loadingDeviceTable = true;
        this.deviceToIds = []; //选中的设备列表
        let keyWord ;
        if(typeof obj=== 'object'){ //
          this.deviceToType =obj.firwareType;
          this.deviceToId = obj.id; 
          keyWord = '';
        }else{ //关键字搜索
          keyWord = obj;
        }
        const params = {
          currentPage: 1,
          pageSize: -1,
          firwareType:this.deviceToType,
          key: keyWord
        };
        apis.getToDevices(params).then((res) => {
          this.loadingDeviceTable = false;
          this.tableDevice = res.items;
        });
      },
      editFirmware(obj){
        this.isFirmwareAdd = false;
        idEdit = obj.id;
        apis.getFirmwareDetail(idEdit).then((res) => {
          this.editFormVisible = true;
          for (let k in this.firmwareInfo) {
            this.firmwareInfo[k] = res[k];
            if(k === 'firwareType'){
              this.firmwareInfo[k] = res[k]+'';
            }
          }
          if(res.attachId){
            for(let k in this.fileInfo){
              this.fileInfo[k] = res[k];
            }
            this.firmwareFileList =[
              {
                name:res.attachName || 'file',
                url: res.attachUrl,
                id: res.attachId
              }
            ];
          }
          
        });
      },
      showDetail(obj) {
        apis.getFirmwareDetail(obj.id).then((res) => {
          this.detailVisible = true;
          for (let item of this.detailInfo) {
            item.v = res[item.label] || '暂无';
          }
          if(res.attachId){
            for(let k in this.fileInfo){
              this.fileInfo[k] = res[k];
            }
          }
        });
      },
      cancelDetail(){
        this.detailVisible = false;
        for(let k in this.fileInfo){
          this.fileInfo[k] = '';
        }
      },
      deleteFirmware(obj){
        this.$confirm("确认删除该固件?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            apis.deleteFirmware(obj.id).then((res) => {
              this.$message.success("删除成功");
              this.getFirmwareData();
            });
          })
          .catch(() => {});
      },
      
      handleSelectionChange(v){
        this.multipleSelection = v;
        const ids = v.map(item => item.id);
        this.deviceToIds = ids; //选中的设备列表
      },
      submitDevice(){
        if(this.deviceToIds.length){
          const params = {
            equipIds: this.deviceToIds,
            id: this.deviceToId
          };
          this.loadingUpgrade = true;
          apis.upgradeFirmware(params).then(res =>{
            this.deviceVisible = false;
            this.loadingUpgrade = false;
            this.$message.success(res||'设备固件升级成功');
          }).catch(() =>{
            this.loadingUpgrade = false;
          });
        }else{
          this.$message.warning('请选择要升级的设备');
        }
      },
      cancelDevice(){
        this.deviceVisible = false;
        this.searchText = '';
        this.loadingUpgrade = false;
        this.deviceToIds = []; //选中的设备列表
      },
      showLog(obj){
        this.logVisible = true;
        const beginTime = this.timeSearch ? this.timeSearch[0]+ ' 00:00:00' : null;
        const endTime = this.timeSearch ? this.timeSearch[1]+ ' 23:59:59' : null;
        if (obj && typeof obj === "number") {
          this.pageLog.currentPage = obj;
        }else{
          this.pageLog.currentPage = 1;
        }
        const parms = {
          beginTime,
          endTime,
          currentPage: this.pageLog.currentPage,
          pageSize: this.pageSize,
        };
        apis.getFirmwareUpgradeLogs(parms).then((res) => {
          this.tableDataLog = res.items;
          this.pageLog.totalSize = res.totalRecords;
        });
      },
      cancelLogPop(){
        this.logVisible = false;
      },
      deleteFile(file){
        const attachId = file.id || file.response.data;
        apis.deleteFirmwareFile(attachId).then(res =>{
          for(let k in this.fileInfo){
            this.fileInfo[k] = '';
          }
        });
      },
      uploadExceed(){
        this.$message.warning('请先删除当前文件再重新上传');
      },
      beforeRemove(file){
        return this.$confirm(`确定删除 ${ file.name }？`);
      },
      downloadFile(file){
        file.url &&apis.downFirmwareFile(file.url).then(res =>{
          this.$message('开始下载');
        });
      },
      async beforeUploadFile(){
        await refreshToken().then(res =>{
          this.accessToken = sessionStorage.getItem('accessToken');
        });
      },
      handleImportSuccess(res){
        if(res.result===200){
          this.fileInfo.attachId = res.data;
        }else{
          this.firmwareFileList = [];
          this.$message.warning((res.message||'上传异常')+'请重新上传');
        }
      }
    },
    activated() {
    }
  };
</script>

<style lang='less'>
.form_gateway{
  margin: 1rem 1.3rem 0.6rem;
  .el-select{
    display: block;
  }
  .el-button{
    color:#999;
    border-color: #DCDFE6;
  }
}
.to_device{
  .tool_bar{
    margin-top: 0.6rem;
    .list_select{
      display: inline-block;
      font-size:0.75rem;
      margin-right: 1rem;
      .el-select{
        width:7.6rem;
      }
      .label{
        display: inline-block;
        font-weight: bold;
      }
    }
    .list_search{
      display: inline-block;
    }
  }
}
.pop_toDevice{
  .el-dialog{
    margin-top: 10vh!important;
  }
  .tool_bar {
    float: right;
    .list_search .el-input-group__append{
      border-radius: 0 2rem 2rem 0;
      padding: 0 0.8rem;
      background: #4977FC;
      button.el-button{
        color:#fff;
      }
    }
  } 
}
.form_table {
  height: 30rem;
  .tool_bar {
    padding: 0.6rem 1rem;
    .list_select {
      font-size: 0.75rem;
      display: inline-block;
      margin-right: 1rem;
      .label {
        display: inline-block;
        font-weight: bold;
      }
    }
  }
}
</style>
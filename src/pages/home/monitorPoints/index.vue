<template>
  <div class="monitor_points">
    <tool-bar @changeArea="getTableByArea" @seachByWord="seachByWord" placeholder="隐患点、监测点名称或编号">
      <template v-slot:searchBefore>
        <div class="list_slot">
          <div class="label">隐患点：</div>
          <el-select v-model="yhd" placeholder="请选择" @change="getTableData" clearable>
            <el-option
              v-for="item in yhds"
              :key="item.hiddenCode"
              :label="item.hiddenName"
              :value="item.hiddenCode"
            ></el-option>
          </el-select>
        </div>
      </template>
      <template v-slot:btnBox>
        <el-button type="primary" icon="el-icon-plus" @click="addItem">添加监测点</el-button>
        
        <file-import name="监测点" pathImport="monitorStation/import" @downTemplate="downTemplate" @importSuccess="getTableData"></file-import>
      </template>
    </tool-bar>
    <div class="table_containner">
      <div class="title_table">监测点列表</div>
      <table-operation
        :loadingTable ='loadingTable'
        :tableData="tableData"
        :fields="fields"
        :operates="operates"
        :currentPage="currentPage"
        :totalSize="totalSize"
        @changePage="getTableData"
      ></table-operation>
    </div>

    <pop-box
      :title="isJcdAdd?'新建监测点':'编辑监测点'"
      :popShow="editFormVisible"
      widthBox="45rem"
      ref="popAdd"
      @submit="submitForm"
      @cancel="cancelForm"
      :isSubmiting='loadingSubmit'
    >
      <el-form
        :model="monitorInfo"
        :rules="rules"
        ref="editForm"
        label-width="7rem"
        class="demo-ruleForm"
      >
        <el-divider content-position="center" class="divider_word">基础信息</el-divider>
        <div class="input_lists">
          <el-form-item label="监测点名称：" prop="monitorName">
            <el-input v-model="monitorInfo.monitorName"></el-input>
          </el-form-item>
          <el-form-item label="监测点编号：" prop="monitorCode">
            <el-input v-model="monitorInfo.monitorCode" :disabled="!isJcdAdd"></el-input>
          </el-form-item>
          <el-form-item label="所属隐患点：" prop="hiddenCode">
            <el-select v-model="monitorInfo.hiddenCode" placeholder="请选择" @change="changeYhd">
              <el-option
                v-for="item in yhds"
                :key="item.hiddenCode"
                :label="item.hiddenName"
                :value="item.hiddenCode"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="地图选点：">
            <el-button icon="el-icon-map-location" @click="popMap">地图选点</el-button>
          </el-form-item>
          <el-form-item label="经度：" prop="lng">
            <el-input v-model="monitorInfo.lng"></el-input>
          </el-form-item>
          <el-form-item label="纬度：" prop="lat">
            <el-input v-model="monitorInfo.lat"></el-input>
          </el-form-item>
          <el-form-item label="高程：" prop="height">
            <el-input v-model="monitorInfo.height"></el-input>
          </el-form-item>
          <el-form-item label="建设日期：" prop="constructionDate">
            <el-date-picker
              v-model="monitorInfo.constructionDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期时间"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="安装日期：" prop="installationDate">
            <el-date-picker
              v-model="monitorInfo.installationDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期时间"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="初测日期：" prop="preliminaryDate">
            <el-date-picker
              v-model="monitorInfo.preliminaryDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期时间"
            ></el-date-picker>
          </el-form-item>
        </div>
        <template>
          <el-divider content-position="center" class="divider_word">平面图位置</el-divider>
          <el-button size="small" @click="openMark" class="btn_mark">平面图标注</el-button>
        </template>
      </el-form>
    </pop-box>
    <pop-box
      title="地图选点"
      :popShow="mapVisible"
      widthBox="45rem"
      ref="map"
      @cancel="cancelMap"
      :includeFooter="false"
    >
      <map-d :positionMap="positionObj" :areaArr="areaArr" @setCoords="setCoords"></map-d>
    </pop-box>
    <pop-box
      title="设备关联"
      :popShow="deviceVisible"
      widthBox="45rem"
      class="device_relate"
      @cancel="cancelDevice"
      :includeFooter="false"
    >
      <div class="lists_device lists_box1">
        <div class="title_word">已绑定列表</div>
        <div class="table_box">
          <table-operation
            :tableData="tableDataBind"
            :fields="fieldsBind"
            :operates="operatesBind"
            :includePage="false"
          ></table-operation>
        </div>
      </div>
      <div class="lists_device lists_box2">
        <div class="title_word">未绑定列表</div>
        <div class="table_box">
          <div class="tool_bar">
            <div class="list_select">
              <div class="label">设备类型：</div>
              <el-select v-model="deviceType" placeholder="请选择" @change="getDevicesNoRelated" clearable="">
                <el-option
                  v-for="item in deviceTypes"
                  :key="item.dicCode"
                  :label="item.dicName"
                  :value="item.dicCode"
                ></el-option>
              </el-select>
            </div>
            <div class="list_search">
              <el-input
                placeholder="请输入关键信息"
                v-model="unbindDeviceSearchText"
                class="input-with-select"
              >
                <el-button slot="append" icon="el-icon-search" @click="getDevicesNoRelated"></el-button>
              </el-input>
            </div>
          </div>
          <table-operation
            :tableData="tableDataUnbind"
            :fields="fieldsBind"
            :operates="operatesUnbind"
            :includePage="false"
          ></table-operation>
        </div>
      </div>
    </pop-box>
    <pic-mark ref="picMarkPop" :picUrl="picUrl" :showX="infoData.xxCoordinate" :showY="infoData.yyCoordinate" :editable="picMark_editable" @on-change="changeMark"></pic-mark>
    <el-dialog
      title="详情"
      :visible.sync="detailVisible"
      width="45rem"
      :close-on-click-modal= false
      append-to-body
      >
      <el-form
        :model="monitorInfo"
        ref="editForm"
        label-width="7rem"
        class="demo-ruleForm detail_form"
         @close= "cancelDetail"
      >
        <el-divider content-position="center" class="divider_word">基础信息</el-divider>
        <div class="input_lists input_lists2">
          <el-form-item label="监测点名称：">
            <span>{{monitorInfo.monitorName}}</span>
          </el-form-item>
          <el-form-item label="监测点编号：" >
            <span>{{monitorInfo.monitorCode}}</span>
          </el-form-item>
          <el-form-item label="所属隐患点：">
            <span>{{monitorInfo.hiddenCode}}</span>
          </el-form-item>
          <el-form-item label="经度：">
            <span>{{monitorInfo.lng}}</span>
          </el-form-item>
          <el-form-item label="纬度：" >
            <span>{{monitorInfo.lat}}</span>
          </el-form-item>
          <el-form-item label="高程：">
            <span>{{monitorInfo.height}}</span>
          </el-form-item>
          <el-form-item label="建设日期：" >
            <span>{{monitorInfo.constructionDate}}</span>
          </el-form-item>
          <el-form-item label="安装日期：" >
            <span>{{monitorInfo.installationDate}}</span>
          </el-form-item>
          <el-form-item label="初测日期：" >
            <span>{{monitorInfo.preliminaryDate}}</span>
          </el-form-item>
        </div>
        <template v-if="picUrl">
          <el-divider content-position="center" class="divider_word">平面图位置</el-divider>
          <div class="img">
            <img :src="ossPrefix + picUrl" />
            <i class="point" v-if="infoData.xxCoordinate||infoData.yyCoordinate" :style="{left: infoData.xxCoordinate*100+'%', top: infoData.yyCoordinate*100+'%'}"></i>
          </div>
        </template>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import tableOperation from "@/components/tableOperation.vue";
import toolBar from "@/components/toolbar.vue";
import popBox from "@/components/popbox.vue";
import picMark from '@/components/picMark.vue';
import fileImport from '@/components/fileImport.vue';
import {attach_server,getYhdDetail, getDict, getYhds, getJcds, addJcd, deleteJcd,getRelatedDevices, getNoRelatedDevices, getJcdDetail, relateDevice, relateDeviceOff, updateJcd, getJcdTemplate} from "@/apis/api";
function requiredItem(msg = "该项不能为空") {
  const obj = { required: true, message: msg };
  return obj;
}
let monitorCode, idEdit;
export default {
  name: "monitorPoints",
  components: {
    tableOperation,
    toolBar,
    popBox,
    picMark,
    fileImport,
    mapD: () => import("@/components/map.vue"),
  },
  data() {
    const validateLngPass = (rule, value, callback) => {
      let reg = /^-?((\d+)|(\d+\.\d+)|(\d+°)|(\d+°\d+′)|(\d+°\d+′\d+″))$/g;
      if(reg.test(value)){
        callback();
      }else{
        callback(new Error('请输入十进制或者度分秒格式'));
      }
    };
    return {
      ossPrefix: attach_server,
      yhd: "",
      yhds: [],
      fields: [
        {
          prop: "monitorCode",
          label: "编号",
          minWidth: 5,
        },
        {
          prop: "monitorName",
          label: "监测点名称",
          minWidth: 6,
        },
        {
          prop: "hiddenName",
          label: "所属隐患点",
          minWidth: 7,
        },
        {
          prop: "lng",
          label: "经度",
          minWidth: 5,
        },
        {
          prop: "lat",
          label: "纬度",
          minWidth: 5,
        },
      ],
      operates: [
        {
          name: "设备",
          method: this.relateDevice,
        },
        {
          name: " 编辑",
          method: this.editJcd,
        },
        {name: "详情",method: this.showDetail,}, 
        {
          name: " 删除",
          method: this.deleteJcd,
        },
      ],
      tableData: [],
      totalSize: 0,
      currentPage: 1,
      monitorInfo: {
        monitorName: "",
        monitorCode: "",
        hiddenCode: "",
        lng: "",
        lat: "",
        height: "",
        constructionDate: null,
        installationDate: null,
        preliminaryDate: null,
      },
      detailVisible: false,
      rules: {
        monitorName: [{ min:1,max:32, message: '输入字符不能超过32位', trigger: 'blur' },requiredItem()],
        monitorCode: [{ min:2,max:20, message: '输入字符在2-20位之间', trigger: 'blur' },requiredItem()],
        hiddenCode: [requiredItem()],
        lng: [{required: true,validator: validateLngPass,trigger: 'blur'}],
        lat: [{required: true,validator: validateLngPass,trigger: 'blur'}]
      },
      editFormVisible: false,
      mapVisible: false,
      deviceVisible: false,
      tableDataBind: [],
      fieldsBind: [
        {
          label: "设备编号",
          prop: "equipCode",
          minWidth: 5,
        },
        {
          label: "设备名称",
          prop: "equipName",
          minWidth: 5,
        },
        {
          label: "生产厂商",
          prop: "manufacturer",
          minWidth: 4,
        },
        {
          label: "所属网关",
          prop: "gateWayName",
          minWidth: 4,
        },
        {
          label: "类型",
          prop: "equipTypeName",
          minWidth: 4,
        },
        {
          label: "在线状态",
          prop: "onLineName",
          minWidth: 4,
        },
      ],
      operatesBind: [
        {
          name: "解除关联",
          method: this.unbindDevice,
        },
      ],
      deviceType: "",
      deviceTypes: [],
      unbindDeviceSearchText: "",
      tableDataUnbind: [],
      operatesUnbind: [
        {
          name: "关联设备",
          method: this.bindDevice,
        },
      ],
      positionObj: {
        long: "",
        lat: "",
      },
      isJcdAdd: true,
      loadingSubmit: false,
      loadingTable: true,
      picUrl:'',
      infoData: {
        xxCoordinate:'',
        yyCoordinate:''
      },
      picMark_editable: true,
      areaArr:[]
    };
  },
  watch: {
    itemCurrent(nV) {
      this.getTableData(1);
      this.getYhds();
    },
    pageSize(nV) {
      this.getTableData(1);
    }
  },
  computed: {
    itemCurrent() {
      return this.$store.state.itemCurrent;
    },
    pageSize() {
      return this.$store.state.pageSize;
    },
  },
  mounted() {
    this.query = {};
    this.getTableData();
    this.getYhds();
  },
  methods: {
    getYhds() {
      //请求隐患点列表
      const obj = { projectId: this.itemCurrent, currentPage: 1, pageSize: -1 };
      getYhds(obj).then((res) => {
        this.yhds = res.items;
      });
    },
    getTableData(num, query) {
      this.loadingTable = true;
      typeof query === "object" && Object.assign(this.query, query);
      num = typeof num === "number" ? num : this.currentPage;
      this.currentPage = num;
      const obj = {
        ...this.query,
        projectId: this.itemCurrent,
        currentPage: num,
        pageSize: this.pageSize,
        hiddenCode: this.yhd,
      };
      this.itemCurrent&&getJcds(obj).then((res) => {
        this.loadingTable = false;
        this.tableData = res.items;
        this.totalSize = res.totalRecords;
      });
    },
    getTableByArea(areaInfo) {
      this.yhds = [];
      this.yhd = "";
      const obj = {
        ...areaInfo,
        projectId: this.itemCurrent,
        currentPage: 1,
        pageSize: -1,
      };
      getYhds(obj).then((res) => {
        this.yhds = res.items;
      });
      this.getTableData(1, areaInfo);
    },
    seachByWord(word) {
      this.getTableData(1, { key: word });
    },
    addItem() {
      this.editFormVisible = true;
      this.isJcdAdd = true;
    },
    changeYhd(v){
      this.getDangerInfoById(v);
      for(let k in this.infoData){
        this.infoData[k] = '';
      }
    },
    editJcd(obj){
      idEdit = obj.id;
      this.isJcdAdd = false;
      getJcdDetail(idEdit).then(res =>{
        this.editFormVisible = true;
        for(let k in this.monitorInfo){
          this.monitorInfo[k] = res [k];
        }
        this.picUrl = res.attachUrl;
        this.infoData.xxCoordinate = res.xxCoordinate;
        this.infoData.yyCoordinate = res.yyCoordinate;
      });
    },
    showDetail(obj) {
      getJcdDetail(obj.id).then((res) => {
        this.detailVisible = true;
        for(let k in this.monitorInfo){
          this.monitorInfo[k] = res [k] || '暂无';
        }
        this.picUrl = res.attachUrl;
        this.infoData.xxCoordinate = res.xxCoordinate;
        this.infoData.yyCoordinate = res.yyCoordinate;
        this.monitorInfo.hiddenCode && (this.monitorInfo.hiddenCode =this.yhds.find(item =>item.hiddenCode === this.monitorInfo.hiddenCode).hiddenName);
      });
    },
    cancelDetail(){
      this.detailVisible = false;
      this.picUrl = '';
      this.infoData.xxCoordinate = null;
      this.infoData.yyCoordinate = null;
      for(let k in this.monitorInfo){
        this.monitorInfo[k] = '';
      }
    },
    deleteJcd(obj) {
      this.$confirm("确认删除该监测点?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteJcd(obj.monitorCode).then(res =>{
            this.$message.success('删除成功');
            this.getTableData();
          });
        })
        .catch(() => {});
    },
    setCoords(obj) {
      this.mapVisible = false;
      this.monitorInfo.lng = obj.long.toFixed(6);
      this.monitorInfo.lat = obj.lat.toFixed(6);
      //this.monitorInfo.height = obj.height.toFixed(6);
    },
    submitForm() { 
      this.$refs["editForm"].validate((valid) => {
        if (valid) {
          this.loadingSubmit = true;
          Object.assign(this.monitorInfo,this.infoData);
          if(this.isJcdAdd){
            addJcd(this.monitorInfo).then((res) => {
              this.loadingSubmit = false;
              this.editFormVisible = false;
              this.$message.success("监测点添加成功");
              this.getTableData();
            }).catch(err =>{
              this.loadingSubmit = false;
            });
          }else{
            updateJcd({...this.monitorInfo, id:idEdit}).then((res) => {
              this.loadingSubmit = false;
              this.editFormVisible = false;
              this.$message.success("监测点修改成功");
              this.getTableData();
            }).catch(err =>{
              this.loadingSubmit = false;
            });
          }
          
        } else {
          return false;
        }
      });
    },
    relateDevice(obj) {
      this.deviceVisible = true;
      monitorCode = obj.monitorCode;
      this.getDevicesNoRelated();
      this.getDevicesRelated();
      getDict('JCSB_TYPE').then(res =>{
        this.deviceTypes = res.filter(item => Number(item.dicCode) !== 6);
      });
    },
    cancelForm() {
      this.editFormVisible = false;
      this.loadingSubmit = false;
      this.$refs["editForm"].resetFields();
      for(let k in this.monitorInfo){
        this.monitorInfo[k] = '';
      }
      this.infoData.xxCoordinate = '';
      this.infoData.yyCoordinate ='';
      this.picUrl = '';
    },
    popMap() {
      if (this.monitorInfo.hiddenCode) {
        this.mapVisible = true;
        const yhdInfo = this.yhds.find(
          (item) => item.hiddenCode === this.monitorInfo.hiddenCode
        );
        this.positionObj.long = yhdInfo.lng;
        this.positionObj.lat = yhdInfo.lat;
        const {provinceId, cityId, areaId} = yhdInfo;
        this.areaArr = [provinceId||'', cityId||'', areaId||''];
      } else {
        this.$message.warning("请先选择所属隐患点");
      }
    },
    cancelMap() {
      this.mapVisible = false;
    },
    cancelDevice() {
      this.deviceVisible = false;
      this.unbindDeviceSearchText = '';

    },
    getDevicesNoRelated() {
      const params ={
        equipType: this.deviceType,
        key: this.unbindDeviceSearchText,
        monitorCode
      };
      getNoRelatedDevices(params).then(res =>{
        this.tableDataUnbind = res;
      });
    },
    getDevicesRelated(){
       getRelatedDevices(monitorCode).then(res =>{
        this.tableDataBind = res;
      });
    },
    unbindDevice(obj) {
      const params = {
        equipCode: obj.equipCode,
        equipType: obj.equipType,
        monitorCode
      };
      relateDeviceOff(params).then(res=>{
        this.getDevicesNoRelated();
        this.getDevicesRelated();
      });
    },
    bindDevice(obj) {
      const params = {
        equipCode: obj.equipCode,
        equipType: obj.equipType,
        monitorCode
      };
      relateDevice(params).then(res=>{
        this.getDevicesNoRelated();
        this.getDevicesRelated();
      });
    },
    getDangerInfoById(id) {
      getYhdDetail(id).then(res => {
        this.picUrl = res.attachUrl;
      });
    },
    openMark() {
      if (!this.monitorInfo.hiddenCode) {
        this.$message.warning('请先选择隐患点');
        return;
      }
      if (!this.picUrl) {
        this.$message.warning('该隐患点未上传平面图');
        return;
      }
      this.$refs.picMarkPop.show();
    },
    changeMark({x,y}) {
      this.infoData.xxCoordinate = x+'';
      this.infoData.yyCoordinate = y+'';
    },
    downTemplate(){
      getJcdTemplate(this.itemCurrent).then(res =>{
        this.$message.success('下载成功');
      });
    },
  }
};
</script>

<style lang='less'>
.monitor_points {
  .ceil {
  }
}

.divider_word .el-divider__text {
  color: #ccc;
}
.demo-ruleForm {
  padding: 0 1rem;
  .input_lists {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-top: 0.8rem;
    .el-form-item {
      width: 46%;
    }
    .el-select {
      width: 100%;
    }
    .el-date-editor.el-input{
      width:100%;
    }
  }
  &.detail_form{
    // .el-form-item{
    //   width: 50%;
    //   border-bottom:0.06rem solid rgba(0,0,0,.1);
    // }
  }
  .img{
    width:15rem;
    margin:0.4rem auto;
    position: relative;
    img{
      display: block;
      width:100%;
    }
    .point {
      position: absolute;
      &:after {
        content: "";
        position: absolute;
        top: -10px;
        left: -10px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: red; //rgba(24,144,255,0.8);
      }
    }
  }
  .input_lists2{
    .el-form-item{
      margin-bottom: 0.2rem;
    }
  }
  .el-button{
    color:#999;
    border-color: #DCDFE6;
  }
  .btn_mark{
    margin:0.5rem 1.2rem;
  }
}
.lists_device {
  margin-bottom: 0.5rem;
  .title_word {
    font-size: 0.8rem;
    color: #888;
    padding-left: 0.6rem;
    margin: 0.3rem 0;
  }
  .table_box {
    background-color: #fafbff;
    border: 0.05rem solid #d8e2f0;
    height: 10rem;
    border-radius: 0.3rem;
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
        .el-select {
          width: 7.8rem;
        }
      }
      .list_search {
        display: inline-block;
        padding-left: 1rem;
        width: 12rem;
        .el-input__inner {
          border-radius: 2rem 0 0 2rem;
          background: #f7f9ff;
          border-color: #e5e5e5;
        }
        .el-input-group__append {
          border-radius: 0 2rem 2rem 0;
          padding: 0 0.8rem;
          background: #4977fc;
          border:0;
          button.el-button {
            color: #fff;
          }
        }
      }
    }
  }
  &.lists_box2 {
    margin-bottom: 0.7rem;
    .table_box {
      height: 20rem;
    }
  }
}
.device_relate .el-dialog {
  margin-top: 10vh !important;
}

</style>
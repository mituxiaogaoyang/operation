<template>
  <div class="gateway">
    <tool-bar @changeArea="getTableByArea" @seachByWord="seachByWord" placeholder="所属隐患点/网关名称/网关SN">
      <template v-slot:btnBox>
        <el-button type="primary" icon="el-icon-plus" @click="addDevice">添加网关设备</el-button>
        <!-- <el-button>导入网关设备</el-button> -->
        <el-button @click="exportDevices" :loading="isExporting">导出设备信息</el-button>
        <file-import name="网关设备" pathImport="gateway/import" @downTemplate="downTemplate" @importSuccess="getDeviceData"></file-import>
      </template>
    </tool-bar>
    <div class="table_containner">
      <div class="title_table">网关设备列表</div>
      <table-operation
        :loadingTable="loadingTable"
        :tableData="tableData"
        :fields="fields"
        :operates="operates"
        :currentPage="currentPage"
        :totalSize="totalSize"
        @changePage="getDeviceData"
      ></table-operation>
    </div>
    <!-- 添加设备 -->
    <pop-box
      :title="isDeviceAdd?'添加网关设备':'编辑网关设备'"
      :popShow="editFormVisible"
      @submit="submitEditForm"
      @cancel="cancelEditForm"
      :isSubmiting="loadingSubmit"
    >
      <el-form
        :model="deviceInfo"
        :rules="deviceRules"
        ref="editForm"
        label-width="6rem"
        class="form_gateway"
      >
        <div class="input_lists">
          <el-form-item label="网关名称：" prop="gatewayName">
            <el-input v-model="deviceInfo.gatewayName"></el-input>
          </el-form-item>
          <el-form-item label="S/N号：" prop="gatewayCode">
            <el-input v-model="deviceInfo.gatewayCode" :disabled="!isDeviceAdd"></el-input>
          </el-form-item>
          <el-form-item label="生产厂商：" prop="manufacturer">
            <el-input v-model="deviceInfo.manufacturer"></el-input>
          </el-form-item>
          <el-form-item label="设备型号：" prop="model">
            <el-input v-model="deviceInfo.model"></el-input>
          </el-form-item>
          <el-form-item label="DEVICE ID：" prop="deviceId">
            <el-input v-model="deviceInfo.deviceId" :disabled="!isDeviceAdd"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </pop-box>
    <detail-pop :popShow="detailVisible" :detailInfo= "detailInfo"  @cancel="cancelDetail"></detail-pop>
    <!--运行状态 -->
    <pop-box
      title="运行状态"
      :popShow="statusVisible"
      widthBox="60%"
      :includeFooter="false"
      @cancel="cancelStatusPop"
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
              @change="getStatus"
            ></el-date-picker>
          </div>
        </div>
        <table-operation :tableData="tableStatusData" :fields="statusFields"
            :currentPage="pageStatus.currentPage"
            :totalSize="pageStatus.totalSize"
            @changePage="getStatus"
        ></table-operation>
      </div>
    </pop-box>
    <!--命令日志 -->
    <pop-box
      title="命令日志"
      :popShow="orderVisible"
      widthBox="60%"
      :includeFooter="false"
      @cancel="cancelOrderPop"
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
              @change="getOrderLog"
            ></el-date-picker>
          </div>
          <div class="list_select">
            <el-button type="primary" @click="exportLog" :loading="isExportingLog">导出日志</el-button>
          </div>
        </div>
        <table-operation
          :tableData="tableOrderData"
          :fields="orderFields"
          :operates="statusOperates"
          :currentPage="pageOrder.currentPage"
          :totalSize="pageOrder.totalSize"
          @changePage="getOrderLog"
        ></table-operation>
      </div>
    </pop-box>
    <!-- 下发命令 -->
    <pop-box
      title="下发命令"
      :popShow="orderSendVisible"
      widthBox="34rem"
      @submit="submitOrderForm"
      @cancel="cancelOrderSendPop"
      :isSubmiting="isSubmiting"
    >
      <div class="order_lists">
        <el-radio-group v-model="orderType">
          <el-radio-button
            :label="list.value"
            v-for="list in orderLists"
            :key="list.value"
          >{{list.label}}</el-radio-button>
          <div class="el-radio-button"></div>
          <div class="el-radio-button"></div>
        </el-radio-group>
      </div>
      <el-divider content-position="left" class="divider_word">参数设置</el-divider>
      <div class="box_setting">
        <template v-if="orderType === 3">
          <el-select v-model="sensorFreq.sensorId" placeholder="请选择传感器编号" class="select_box2">
            <el-option
              :label="item.equipName"
              :value="item.dataFlowCode"
              :key="item.equipCode"
              v-for="item in sensors"
            ></el-option>
          </el-select>
          <el-input v-model="sensorFreq.plusIntv" placeholder="请输入加报间隔（分钟）"></el-input>
          <!-- <el-input v-model="sensorFreq.sampleIntv" placeholder="请输入采样间隔（分钟）"></el-input> -->
          <el-input v-model="sensorFreq.uploadIntv" placeholder="请输入上传间隔（分钟）"></el-input>
        </template>
        <template v-else-if=" (orderType === 4 || orderType ===6)">
          <el-select v-model="sensorFreq.sensorId" placeholder="请选择传感器编号" class="select_box2">
            <el-option
              :label="item.equipName"
              :value="item.dataFlowCode"
              :key="item.equipCode"
              v-for="item in sensors"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="orderType === 5">
          <el-select v-model="sensorFreq.sensorId" placeholder="请选择传感器编号" class="select_box2" @change="changeSensor">
            <el-option
              :label="item.equipName"
              :value="item.dataFlowCode"
              :key="item.equipCode"
              v-for="item in sensors"
            ></el-option>
          </el-select>
          <el-input v-model="sensorAttr.threshold" v-if="!isRainSensor" placeholder="请输入阈值"></el-input>
          <el-input v-model="sensorAttr.upperLimit" placeholder="请输入上限值"></el-input>
          <el-input v-model="sensorAttr.lowerLimit" placeholder="请输入下限值"></el-input>
        </template>
        <template v-else-if="orderType === 9">
          <span class="label">工作模式选择：</span>
          <el-radio-group v-model="workMode">
            <el-radio :label="0">正常模式</el-radio>
            <el-radio :label="1">节能模式</el-radio>
          </el-radio-group>
        </template>
        <template v-else-if="orderType === 12">
          <el-select v-model="firmware" class="select_box2" placeholder="请选择要升级的固件">
            <el-option
              :label="item.firwareName"
              :value="item.id"
              :key="item.id"
              v-for="item in firmwares"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="orderType === 13">
          <el-select v-model="controlNo" class="select_box2">
            <el-option label="节点1" value="1"></el-option>
            <el-option label="节点2" value="2"></el-option>
          </el-select>
        </template>
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
import { stampToYMD } from "@/libs/init";
import fileImport from '@/components/fileImport.vue';
const orderLists = [
  { value: 1, label: "获取终端时间" }, //gnss
  { value: 2, label: "校正设备时间" }, //gnss
  { value: 3, label: "设置上报频度" },
  { value: 4, label: "获取上报频度" },
  { value: 5, label: "设置传感器属性" },
  { value: 6, label: "获取传感器属性" },
  { value: 7, label: "获取传感器类型" },
  { value: 8, label: "传感器遥测" },
  { value: 9, label: "设置工作模式" }, //gnss
  { value: 10, label: "获取工作模式" }, //gnss
  { value: 11, label: "重启终端" }, //gnss
  { value: 12, label: "固件升级" }, //gnss
  { value: 13, label: "获取平台相关参数" },
  { value: 14, label: "获取工作状态" }, //gnss
];
function requiredItem(msg = "该项不能为空") {
  const obj = { required: true, message: msg };
  return obj;
}
function hasEmpty(obj) {
  let flag = false;
  for (const k in obj) {
    if (obj[k] === "" || obj[k] === null) {
      flag = true;
    }
  }
  return flag;
}
let idEdit;
export default {
  name: "gatewayDevices",
  components: {
    tableOperation,
    toolBar,
    popBox,
    fileImport,
    detailPop
  },
  data() {
    return {
      isRainSensor: false,
      tableData: [],
      fields: [
        {
          prop: "gatewayCode",
          label: "网关SN",
          minWidth: 4,
        },
        {
          prop: "gatewayName",
          label: "网关名称",
          minWidth: 4,
        },
        {
          prop: "monitorName",
          label: "监测点",
          minWidth: 4,
        },
        {
          prop: "hiddenName",
          label: "隐患点",
          minWidth: 4,
        },
        {
          prop: "deviceId",
          label: "DEVICE ID",
          minWidth: 4,
        },
        {
          prop: "apiKey",
          label: "API-key",
          minWidth: 4,
        },
        {
          prop: "onlineName",
          label: "在线状态",
          minWidth: 4,
        },
      ],
      operates: [
        {
          name: "运行状态",
          method: this.getStatus,
        },
        {
          name: " 下发命令",
          method: this.sendOrder,
        },
        {
          name: " 命令日志",
          method: this.getOrderLog,
        },
        {
          name: " 编辑",
          method: this.editDevice,
        },
        {
          name: " 详情",
          method: this.showDetail,
        },
        {
          name: " 删除",
          method: this.deleteDevice,
        },
      ],
      editFormVisible: false,
      isDeviceAdd: true,
      loadingSubmit: false,
      deviceInfo: {
        gatewayName: "",
        gatewayCode: "",
        manufacturer: "",
        model: "",
        deviceId: '',
      },
      detailVisible: false,
      detailInfo: [
        {label:'gatewayName', name: '网关名称', v:''},
        {label:'gatewayCode', name: 'S/N号', v:''},
        {label:'manufacturer', name: '生产厂商', v:''},
        {label:'monitorName', name: '监测点', v:''},
        {label:'hiddenName', name: '隐患点', v:''},
        {label:'model', name: '设备型号', v:''},
        {label:'deviceId', name: 'DEVICE ID', v:''},
        {label:'apiKey', name: 'API-key', v:''},
      ],
      currentPage: 1,
      totalSize: 0,
      pageOrder: {
        currentPage: 1,
        totalSize: 0,
      },
      pageStatus: {
        currentPage: 1,
        totalSize: 0,
      },
      deviceRules: {
        gatewayName: [{ min:1,max:32, message: '输入字符不能超过32位', trigger: 'blur' },requiredItem()],
        gatewayCode: [{ min:2,max:20, message: '输入字符在2-20位之间', trigger: 'blur' },requiredItem()],
        manufacturer: [requiredItem()],
        model: [requiredItem()],
        deviceId: [{ min:4,max:20, message: '输入字符4-20位之间', trigger: 'blur' },requiredItem()],
      },
      statusVisible: false,
      timeSearch: [],
      tableStatusData: [],
      statusFields: [
        {
          prop: "collectTime",
          label: "上报时间",
          minWidth: 5,
        },
        {
          prop: "supplyPower",
          label: "蓄电池电量(%)",
          minWidth: 4,
        },
        {
          prop: "batteryVolt",
          label: "蓄电池电压(v)",
          minWidth: 4,
        },
        {
          prop: "solarVolt",
          label: "太阳能板电压(v)",
          minWidth: 5,
        },
        {
          prop: "fourGSignal",
          label: "网络信号强度(dBm)",
          minWidth: 6,
        },
        {
          prop: "temp",
          label: "设备温度(℃)",
          minWidth: 4,
        },
        {
          prop: "swVersion",
          label: "固件版本号",
          minWidth: 4,
        },
      ],
      orderVisible: false,
      tableOrderData: [],
      orderFields: [
        {
          prop: "body",
          label: "下发内容",
          minWidth: 6,
        },
        {
          prop: "stateName",
          label: "命令状态",
          minWidth: 4,
        },
        {
          prop: "confirmBody",
          label: "响应内容",
          minWidth: 5,
        },
        {
          prop: "sendTime",
          label: "下发时间",
          minWidth: 5,
        },
      ],
      statusOperates: [
        {
          name: "重新发送",
          method: this.sendOrder2,
        },
      ],
      orderSendVisible: false,
      orderType: null,
      orderLists,
      isExporting: false,
      isExportingLog: false,
      sensorFreq: {
        sensorId: "",
        plusIntv: "",
        uploadIntv: "",
      },
      sensorAttr: {
        threshold: "",
        upperLimit: "",
        lowerLimit: "",
      },
      workMode: 0, // 0--正常模式  1--节能模式
      controlNo: "",
      isSubmiting: false,
      loadingTable: true,
      sensors: [],
      firmwares: [],
      firmware:''
    };
  },
  computed: {
    itemCurrent() {
      return this.$store.state.itemCurrent;
    },
    pageSize() {
      return this.$store.state.pageSize;
    },
  },
  watch: {
    itemCurrent(nV) {
      this.getDeviceData(1);
    },
    pageSize(nV) {
      this.getDeviceData(1);
    },
  },
  created() {
    const day7ToMsec = 7 * 24 * 60 * 60 * 1000;
    const msecNow = Date.now();
    const timeStart = msecNow - day7ToMsec;
    const timeEnd = new Date();
    this.timeSearch = [stampToYMD(timeStart), stampToYMD(msecNow)];
  },
  mounted() {
    this.areaInfo = {
      areaId: "",
      cityId: "",
      provinceId: "",
    };
    this.query = {};
    this.getDeviceData();
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
      };
      this.itemCurrent&&apis.getGateways(obj).then((res) => {
        this.loadingTable = false;
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
    exportDevices() {
      this.isExporting = true;
      Object.assign(this.areaInfo, {projectId: this.itemCurrent, key: this.searchWord });
      apis.exportGateways({ ...this.areaInfo }).then((res) => {
        this.isExporting = false;
      });
    },
    addDevice() {
      this.editFormVisible = true;
      this.isDeviceAdd = true;
    },
    changeSensor(v){
      const eType = (this.sensors.find(item => item.dataFlowCode === v)).equipType;
      this.isRainSensor = (Number(eType) ===1);
      this.sensorAttr.threshold = this.isRainSensor ? '0' : '';
    },
    async getStatus(obj) {
      this.statusVisible = true;
      const begin = this.timeSearch ? this.timeSearch[0]+ ' 00:00:00' : null;
      const end = this.timeSearch ? this.timeSearch[1]+ ' 23:59:59' : null;
      if (obj && typeof obj === "object" && obj.gatewayCode) {
        this.deviceId = obj.deviceId;
        this.pageStatus.currentPage = 1;
        await apis.getGatewayTypes(obj.gatewayCode).then((res) => {
          const gnssDevice = res.find(
            (item) => item.equipType === "3" || item.equipType === "4"
          );
          if (gnssDevice) {//gnss-0  rtu-1
            this.gatewayType = 0;
          } else {
            this.gatewayType = 1;
          }  
        });
      } else if (typeof obj === "number") {
        this.pageStatus.currentPage = obj;
      }
      
      const parms = {
        begin,
        end,
        gatewayType: this.gatewayType,
        currentPage: this.pageStatus.currentPage,
        deviceId: this.deviceId,
        pageSize: this.pageSize,
      };
      apis.getGatewayState(parms).then((res) => {
        this.tableStatusData = res.items;
        this.pageStatus.totalSize = res.totalRecords;
      });
      
    },
    cancelStatusPop() {
      this.statusVisible = false;
    },
    sendOrder(obj) {
      this.orderCode = obj.deviceId;
      this.deviceToId = obj.id;
      //equipType 3,4都为gnss
      apis.getGatewayTypes(obj.gatewayCode).then((res) => {
        const gnssDevice = res.find(
          (item) => item.equipType === "3" || item.equipType === "4"
        );
        this.sensors = res;
        const params = {
          currentPage: 1,
          pageSize: -1,
          firwareType: 0
        };
        if (gnssDevice) {
          const orderKeys =[1,2,9,10,11,12,14];
          this.orderLists = orderLists.filter(item => orderKeys.includes(item.value));
          this.orderSendVisible = true;
          params.firwareType =3;
        } else {
          this.orderLists = orderLists;
          this.orderSendVisible = true;
          params.firwareType = 6;
        }
        apis.getFirmwares(params).then((res) => {
          this.firmwares = res.items;
        });
      });
    },
    sendOrder2(obj){
      this.$confirm("确认重新发送该命令?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          apis.sendOrderAgain(obj.id).then(res =>{
            this.$alert(res, '响应内容', {
              confirmButtonText: "确定",
              dangerouslyUseHTMLString: true,
              // callback: action => {
              //   this.$emit('getTable');
              // }
            });
          });
        })
        .catch(() => {});
    },
    getOrderLog(obj) {
      const beginTime = this.timeSearch ? this.timeSearch[0]+ ' 00:00:00' : null;
      const endTime = this.timeSearch ? this.timeSearch[1]+ ' 23:59:59' : null;
      if (obj && typeof obj === "object" && obj.deviceId) {
        this.gatewayDeviceId = obj.deviceId;
        this.pageOrder.currentPage = 1;
      } else if (typeof obj === "number") {
        this.pageOrder.currentPage = obj;
      }
      const parms = {
        beginTime,
        endTime,
        currentPage: this.pageOrder.currentPage,
        deviceId: this.gatewayDeviceId,
        pageSize: this.pageSize,
      };
      this.orderVisible = true;
      apis.getOrders(parms).then((res) => {
        this.tableOrderData = res.items;
        this.pageOrder.totalSize = res.totalRecords;
      });
    },
    exportLog() {
      this.isExportingLog = true;
      const beginTime = this.timeSearch ? this.timeSearch[0]+ ' 00:00:00' : null;
      const endTime = this.timeSearch ? this.timeSearch[1]+ ' 23:59:59' : null;
      const params = {
        beginTime,
        endTime,
        deviceId: this.gatewayDeviceId,
      };
      apis.exportOrders({ ...params }).then((res) => {
        this.isExportingLog = false;
      });
    },
    cancelOrderPop() {
      this.orderVisible = false;
    },
    editDevice(obj) {
      this.isDeviceAdd = false;
      idEdit = obj.id;
      apis.getGatewayDetail(idEdit).then((res) => {
        this.editFormVisible = true;
        for (let k in this.deviceInfo) {
          this.deviceInfo[k] = res[k];
        }
      });
    },
    showDetail(obj) {
      apis.getGatewayDetail(obj.id).then((res) => {
        this.detailVisible = true;
        for (let item of this.detailInfo) {
          if(item.label === 'monitorName'){
            item.v = obj[item.label]|| '暂无';
          }else if(item.label === 'hiddenName'){
            item.v = obj[item.label]|| '暂无';
          }else{
            item.v = res[item.label]|| '暂无';
          }
          
        }
      });
    },
    deleteDevice(obj) {
      this.$confirm("确认删除该网关设备?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          apis.deleteGateway(obj.id).then((res) => {
            this.$message.success("删除成功");
            this.getDeviceData();
          });
        })
        .catch(() => {});
    },
    submitEditForm() {
      this.$refs["editForm"].validate((valid) => {
        if (valid) {
          this.loadingSubmit = true;
          if (this.isDeviceAdd) {
            apis.addGateway({...this.deviceInfo,createProjectId: this.itemCurrent}).then((res) => {
              this.loadingSubmit = false;
              this.editFormVisible = false;
              this.$message.success("网关设备添加成功");
              this.getDeviceData();
            }).catch(() => {
              this.loadingSubmit = false;
            });
          } else {
            apis
              .updateGateway({ ...this.deviceInfo, id: idEdit,createProjectId: this.itemCurrent })
              .then((res) => {
                this.loadingSubmit = false;
                this.editFormVisible = false;
                this.$message.success("网关设备修改成功");
                this.getDeviceData();
              }).catch(() => {
                this.loadingSubmit = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    cancelEditForm() {
      this.editFormVisible = false;
      this.loadingSubmit = false;
      this.$refs["editForm"].resetFields();
      for (let k in this.deviceInfo) {
        this.deviceInfo[k] = "";
      }
    },
    cancelDetail(){
      this.detailVisible = false;
    },
    submitOrderForm() {
      const index = this.orderType;
      if (!index) {
        this.$message.warning("请选择要下发的命令");
        return;
      }
      const code = this.orderCode;
      this.isSubmiting = true;

      switch (index) {
        case 1:
          apis.getTerminalTime(code).then((res) => {
            this.popNotify("终端时间", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        case 2: {
          apis.setDevicelTime(code).then((res) => {
            this.popNotify("校正设备时间", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        }
        case 3: {
          const objSensorFreq = { ...this.sensorFreq };
          if (!hasEmpty(objSensorFreq)) {
            apis.setSensorTime(code, objSensorFreq).then((res) => {
              this.popNotify("设置传感器采集上报频度", res);
            }).catch(() =>{
              this.isSubmiting = false;
            });
          } else {
            this.$message.warning("请输入所有参数");
            this.isSubmiting = false;
          }
          break;
        }
        case 4: {
          const sensorId = this.sensorFreq.sensorId;
          if (sensorId) {
            apis.getSensorTime(code, sensorId).then((res) => {
              //const res2 = res.replace(/；/g, "；<br/>");
              this.popNotify("传感器采集上报频度", res);
            }).catch(() =>{
              this.isSubmiting = false;
            });
          } else {
            this.$message.warning("请输入参数");
            this.isSubmiting = false;
          }

          break;
        }
        case 5: {
          const sensorAttr = { ...this.sensorAttr, sensorId: this.sensorFreq.sensorId };
          if (!hasEmpty(sensorAttr)) {
            apis.setSensorAttr(code, sensorAttr).then((res) => {
              this.popNotify("设置传感器属性", res);
            }).catch(() =>{
              this.isSubmiting = false;
            });
          } else {
            this.$message.warning("请输入所有参数");
            this.isSubmiting = false;
          }
          break;
        }
        case 6: {
          const sensorId2 = this.sensorFreq.sensorId;
          if (sensorId2) {
            apis.getSensorAttr(code, sensorId2).then((res) => {
              //const res2 = res.replace(/；/g, "；<br/>");
              this.popNotify("传感器属性", res);
            }).catch(() =>{
              this.isSubmiting = false;
            });
          } else {
            this.$message.warning("请输入参数");
            this.isSubmiting = false;
          }
          break;
        }
        case 7:
          apis.getSensorType(code).then((res) => {
            this.popNotify("支持传感器类型", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        case 8:
          apis.getSensorTest(code).then((res) => {
            this.popNotify("传感器遥测", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        case 9: {
          const mode = this.workMode;
          apis.setWorkMode(code, mode).then((res) => {
            this.popNotify("设置工作模式", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        }
        case 10:
          apis.getWorkMode(code).then((res) => {
            this.popNotify("工作模式", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        case 11:
          apis.restart(code).then((res) => {
            this.popNotify("重启终端", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        case 12:{
          const params = {
            equipIds: [this.deviceToId],
            id: this.firmware
          };
          this.firmware &&
          apis.upgradeFirmware(params).then((res) => {
            this.popNotify("固件升级成功", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
        } 
        case 13: {
          const controlNo = this.controlNo;
          if (controlNo) {
            apis.getParams(code, controlNo).then((res) => {
              //const res2 = res.replace(/；/g, "；<br/>");
              this.popNotify("平台相关参数", res);
            }).catch(() =>{
              this.isSubmiting = false;
            });
          } else {
            this.$message.warning("请输入参数");
            this.isSubmiting = false;
          }
          break;
        }
        case 14:
          apis.getRTUstate(code).then((res) => {
            //const res2 = res.replace(/；/g, "；<br/>");
            this.popNotify("工作状态", res);
          }).catch(() =>{
            this.isSubmiting = false;
          });
          break;
      }
    },
    popNotify(title, value) {
      this.isSubmiting = false;
      this.$alert(value, title, {
        confirmButtonText: "确定",
        dangerouslyUseHTMLString: true,
        // callback: action => {
        //   this.$emit('getTable');
        // }
      });
    },
    cancelOrderSendPop() {
      this.orderSendVisible = false;
      this.isSubmiting = false;
      this.firmware = '';
      this.orderType = 0;
      for(let i in this.sensorFreq){
        this.sensorFreq[i] = '';
      }
      for(let i in this.sensorAttr){
        this.sensorAttr[i] = '';
      }
      this.isRainSensor = false;
    },
    downTemplate(){
      apis.getGatewayTemplate().then(res =>{
        this.$message.success('下载成功');
      });
    },
  },
};
</script>

<style lang='less'>
.form_gateway {
  margin: 1.2rem 1rem 1rem;
  .detail_value{
    color:#aaa;
    font-size: 0.65rem;
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
.order_lists {
  margin: 1rem;
  .el-radio-group {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .el-radio-button {
      width: 23.5%;
      margin: 0.4rem 0;
      .el-radio-button__inner {
        border: 1px solid #dcdfe6;
        color: #666;
        display: block;
        box-sizing: border-box;
        border-radius: 0.3rem;
        font-size: 0.7rem;
        padding: 0.6rem 0;
        display: block;
      }
      &.is-active {
        .el-radio-button__inner {
          color: #fff;
          border-color: transparent;
        }
      }
    }
  }
}
.box_setting {
  margin: 1rem;
  .el-input {
    margin-bottom: 1rem;
    width: 70%;
  }
  .select_box2 {
    width: 70%;
    .el-input {
      width: 100%;
    }
  }
}
</style>
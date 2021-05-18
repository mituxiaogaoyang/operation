<template>
  <div class="broadcast">
    <tool-bar @changeArea="getTableByArea" @seachByWord="seachByWord" placeholder="设备编号、设备名称、广播卡号、监测点名称">
      <template v-slot:searchBefore>
        <div class="list_slot">
          <div class="label">状态：</div>
          <el-select v-model="statusOnline" placeholder="请选择" clearable @change="getDeviceData">
            <el-option
              v-for="item in statusDic"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </template>
      <template v-slot:btnBox>
        <el-button type="primary" icon="el-icon-plus" @click="addDevice">添加设备</el-button>
        <file-import name="广播设备" pathImport="broad/import" @downTemplate="downTemplate" @importSuccess="getDeviceData"></file-import>
      </template>
    </tool-bar>
    <div class="table_containner">
      <div class="title_table">广播设备列表</div>
      <table-operation
        :tableData="tableData"
        :fields="fields"
        :operates="operates"
        :loadingTable="loadingTable"
        :currentPage="currentPage"
        :totalSize="totalSize"
        @changePage="getDeviceData"
      ></table-operation>
    </div>
    <!-- 添加设备 -->
    <pop-box
      :title="isDeviceAdd?'添加广播设备':'编辑广播设备'"
      :popShow="editFormVisible"
      @submit="submitEditForm"
      @cancel="cancelEditForm"
      :isSubmiting="loadingSubmit"
    >
      <el-form
        :model="deviceInfo"
        :rules="deviceRules"
        ref="editForm"
        label-width="7rem"
        class="form_gateway"
      >
        <div class="input_lists">
          <el-form-item label="设备名称：" prop="broadName">
            <el-input v-model="deviceInfo.broadName"></el-input>
          </el-form-item>
          <el-form-item label="S/N号：" prop="broadCode">
            <el-input v-model="deviceInfo.broadCode" :disabled="!isDeviceAdd"></el-input>
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
          <el-form-item label="设备型号：" prop="model">
            <el-input v-model="deviceInfo.model"></el-input>
          </el-form-item>
          <el-form-item label="deviceId：" prop="deviceId">
            <el-input v-model="deviceInfo.deviceId" :disabled="!isDeviceAdd"></el-input>
          </el-form-item>
          <el-form-item label="生产厂商：" prop="manufacturer">
            <el-input v-model="deviceInfo.manufacturer"></el-input>
          </el-form-item>
          <el-form-item label="广播卡号：" prop="broadCard">
            <el-input v-model="deviceInfo.broadCard"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </pop-box>
    <detail-pop :popShow="detailVisible" :detailInfo= "detailInfo"  @cancel="cancelDetail"></detail-pop>
    <!-- 运行状态 -->
    <pop-box
      title="运行状态"
      :popShow="statusVisible"
      :includeFooter="false"
      @cancel="cancelStatus"
      widthBox="60%"
      class="status_pop"
    >
      <div class="number_lists">
        <div class="list">
          <div class="q">当前状态：</div>
          <div class="a">{{statusData.isOnline?'在线':'离线'}}</div>
        </div>
        <div class="list">
          <div class="q">在线时长：</div>
          <div class="a">{{statusData.timeOnline}}</div>
        </div>
        <div class="list">
          <div class="q">离线时长：</div>
          <div class="a">{{statusData.timeOffline}}</div>
        </div>
        <!-- <div class="list">
          <div class="q">工作电压(v)：</div>
          <div class="a">{{statusData.voltage}}</div>
        </div>-->
      </div>
      <div class="time_select">
        <div class="label">选择日期：</div>
        <el-date-picker
          v-model="timeSearch"
          type="daterange"
          range-separator="~"
          value-format="yyyy-MM-dd"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="getRadioTimeChart"
        ></el-date-picker>
      </div>
      <div class="chart_box">
        <chart-status :statusArr="statusArr" :timeArr="timeArr" :timeEnd="timeEnd"></chart-status>
      </div>
    </pop-box>
    <!-- 广播播发 -->
    <pop-box
      title="广播播发"
      :popShow="broadcastVisible"
      @submit="submitBroadcastForm"
      @cancel="cancelBroadcastForm"
      :isSubmiting="loadingSubmit2"
    >
      <el-form
        :model="broadcastInfo"
        :rules="broadcastRules"
        ref="editForm2"
        label-width="6rem"
        class="form_gateway"
      >
        <el-form-item label="播发内容：" prop="message">
          <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="broadcastInfo.message"></el-input>
        </el-form-item>
        <el-form-item label="播放次数：" prop="num">
          <el-select v-model="broadcastInfo.num" placeholder="请选择">
            <el-option v-for="item in 6" :key="'times'+item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </pop-box>
    <!-- 播发记录 -->
    <pop-box
      title="播发记录"
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
              range-separator="~"
              value-format="yyyy-MM-dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="showLog"
            ></el-date-picker>
          </div>
          <div class="list_select">
            <el-button type="primary" @click="exportLog" :loading="isExportingLog">导出记录</el-button>
          </div>
        </div>
        <table-operation
          :tableData="tableOrderData"
          :fields="logFields"
          :operates="operatesLog"
          :currentPage="pageOrder.currentPage"
          :totalSize="pageOrder.totalSize"
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
import chartStatus from "./statusChart3";
import { stampToYMD } from "@/libs/init";
import * as apis from "@/apis/api";
import fileImport from '@/components/fileImport.vue';
const status = [
  { label: "在线", value: "1" },
  { label: "离线", value: "0" },
];
function requiredItem(msg = "该项不能为空") {
  const obj = { required: true, message: msg };
  return obj;
}
let idEdit;
export default {
  name: "broadcastDevices",
  components: {
    tableOperation,
    toolBar,
    popBox,
    chartStatus,
    fileImport,
    detailPop
  },
  data() {
    return {
      statusOnline: "",
      statusDic: status,
      tableData: [],
      tableOrderData: [],
      fields: [
        {
          prop: "broadCode",
          label: "设备编号",
          minWidth: 4,
        },
        {
          prop: "broadName",
          label: "设备名称",
          minWidth: 5,
        },
        {
          prop: "broadCard",
          label: "广播卡号",
          minWidth: 4,
        },
        {
          prop: "monitorName",
          label: "所属监测点",
          minWidth: 5,
        },
        {
          prop: "onlineName",
          label: "在线状态",
          minWidth: 3,
        },
      ],
      operates: [
        { name: "运行状态", method: this.showStatus },
        { name: "广播播发", method: this.sendBroadcast },
        { name: "播发记录", method: this.showLog },
        { name: "编辑", method: this.editDevice },
         {name: "详情",method: this.showDetail,}, 
        { name: "删除", method: this.deleteDevice },
      ],
      currentPage: 1,
      totalSize: 0,
      editFormVisible: false,
      deviceInfo: {
        broadCard: "",
        broadCode: "",
        broadName: "",
        manufacturer: "",
        deviceId: "",
        model: "",
        monitorCode: "",
      },
      detailInfo: [
        {label:'broadName', name: '设备名称', v:''},
        {label:'broadCode', name: 'S/N号', v:''},
        {label:'monitorName', name: '所属监测点', v:''},
        {label:'model', name: '设备型号', v:''},
        {label:'deviceId', name: 'deviceId', v:''},
        {label:'manufacturer', name: '生产厂商', v:''},
        {label:'broadCard', name: '广播卡号', v:''},
        {label:'apiKey', name: 'apiKey', v:''},
      ],
      monitors: [],
      deviceRules: {
        monitorCode: [requiredItem()],
        broadCode: [{ min:1,max:20, message: '输入字符不能超过20位', trigger: 'blur' },requiredItem()],
        broadName: [{ min:1,max:32, message: '输入字符不能超过32位', trigger: 'blur' },requiredItem()],
        model: [requiredItem()],
        broadCard2: [requiredItem()],
        deviceId: [{ min:4,max:20, message: '输入字符4-20位之间', trigger: 'blur' },requiredItem()],
      },
      isDeviceAdd: true,
      loadingSubmit: false,
      loadingSubmit2: false,
      loadingTable: true,
      statusVisible: false,
      broadcastVisible: false,
      detailVisible: false,
      broadcastInfo: {
        message: "",
        num: 1,
      },
      broadcastRules: {
        message: [requiredItem()],
      },
      logVisible: false,
      timeSearch: [],
      tableLog: [],
      logFields: [
        {
          prop: "body",
          label: "下发内容",
          minWidth: 9,
        },
        {
          prop: "stateName",
          label: "命令状态",
          minWidth: 4,
        },
        {
          prop: "circleNum",
          label: "循环次数",
          minWidth: 4,
        },
        {
          prop: "sendTime",
          label: "下发时间",
          minWidth: 5,
        },
      ],
      operatesLog: [{ name: "重新发送", method: this.sendAgain }],
      statusArr: [],
      timeArr: [],
      timeEnd: "",
      statusData: {
        isOnline: false,
        timeOnline: 0,
        timeOffline: 0,
        voltage: 220,
      },
      pageOrder: {
        currentPage: 1,
        totalSize: 0,
      },
      isExportingLog: false,
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
      this.getMonitors();
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
    this.getMonitors();
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
        onLineState: this.statusOnline.length ? Number(this.statusOnline) : "",
        pageSize: this.pageSize,
      };
      this.itemCurrent&&apis.getRadios(obj).then((res) => {
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
    getMonitors() {
      const obj = {
        projectId: this.itemCurrent,
        currentPage: 1,
        pageSize: -1,
      };
      apis.getJcds(obj).then((res) => {
        this.monitors = res.items;
      });
    },
    addDevice() {
      this.editFormVisible = true;
      this.isDeviceAdd = true;
    },
    editDevice(obj) {
      this.isDeviceAdd = false;
      idEdit = obj.id;
      apis.getRadioDetail(idEdit).then((res) => {
        this.editFormVisible = true;
        for (let k in this.deviceInfo) {
          this.deviceInfo[k] = res[k];
        }
      });
    },
    showDetail(obj) {
      apis.getRadioDetail(obj.id).then((res) => {
        this.detailVisible = true;
        for (let item of this.detailInfo) {
          item.v = res[item.label] || '暂无';
        }
      });
    },
    cancelDetail(){
      this.detailVisible = false;
    },
    deleteDevice(obj) {
      this.$confirm("确认删除该广播设备?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          apis.deleteRadio(obj.id).then((res) => {
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
            apis.addRadio({...this.deviceInfo,createProjectId: this.itemCurrent}).then((res) => {
              this.loadingSubmit = false;
              this.editFormVisible = false;
              this.$message.success("广播设备添加成功");
              this.getDeviceData();
            }).catch(() => {
              this.loadingSubmit = false;
            });
          } else {
            apis.updateRadio({ ...this.deviceInfo, id: idEdit,createProjectId: this.itemCurrent }).then((res) => {
              this.loadingSubmit = false;
              this.editFormVisible = false;
              this.$message.success("广播设备修改成功");
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
      this.$refs["editForm"].resetFields();
      this.editFormVisible = false;
      this.loadingSubmit = false;
      for (let k in this.deviceInfo) {
        this.deviceInfo[k] = "";
      }
    },
    showStatus(obj) {
      this.statusVisible = true;
      this.deviceId = obj.deviceId;
      apis.getRadioTime(obj.deviceId).then((res) => {
        this.statusData.isOnline = res.online;
        const daySecond = 24 * 60 * 60;
        const timeOnline = res.onlineSecond || 0;
        const timeOffline = res.outlineSecond || 0;
        if (timeOnline > daySecond) {
          const day = Math.floor(timeOnline / daySecond);
          const hour = Math.ceil((timeOnline % daySecond) / 3600);
          this.statusData.timeOnline = day + "天" + hour + "小时";
        } else if (timeOnline > 3600) {
          const hour = Math.floor(timeOnline / 3600);
          const minute = Math.ceil((timeOnline % 3600) / 60);
          this.statusData.timeOnline = hour + "小时" + minute + "分";
        } else if (timeOnline > 60) {
          const minute = Math.floor(timeOnline / 60);
          const second = Math.ceil(timeOnline % 60);
          this.statusData.timeOnline = minute + "分" + second + "秒";
        } else {
          this.statusData.timeOnline = timeOnline + "秒";
        }

        if (timeOffline > daySecond) {
          const day = Math.floor(timeOffline / daySecond);
          const hour = Math.ceil((timeOffline % daySecond) / 3600);
          this.statusData.timeOffline = day + "天" + hour + "小时";
        } else if (timeOffline > 3600) {
          const hour = Math.floor(timeOffline / 3600);
          const minute = Math.ceil((timeOffline % 3600) / 60);
          this.statusData.timeOffline = hour + "小时" + minute + "分";
        } else if (timeOffline > 60) {
          const minute = Math.floor(timeOffline / 60);
          const second = Math.ceil(timeOffline % 60);
          this.statusData.timeOffline = minute + "分" + second + "秒";
        } else {
          this.statusData.timeOffline = timeOffline + "秒";
        }
      });
      this.getRadioTimeChart();
    },
    getRadioTimeChart() {
      const beginTime = this.timeSearch
        ? this.timeSearch[0] + " 00:00:00"
        : null;
      const endTime = this.timeSearch ? this.timeSearch[1] + " 23:59:59" : null;
      const params = {
        beginTime,
        endTime,
        currentPage: 1,
        deviceId: "BRO123456",// this.deviceId,
        pageSize: -1,
      };
      let timeArr = [],
        statusArr = [];
      apis.getRadioTimeList(params).then((res) => {
        let dataArr;
        if (res.items && res.items.length) {
          dataArr = res.items.filter(item => item.changeTime);

          dataArr.map(
            (item) => (item.time = new Date(item.changeTime).getTime())
          );
          dataArr.sort((a, b) => {
            return a.time - b.time;
          });
        } else {
          dataArr = [];
        }

        dataArr.forEach((item, i) => {
          if (i > dataArr.length - 2) {
            return;
          }
          if (
            dataArr[i + 1].online !== dataArr[i].online &&
            dataArr[i + 1].time === dataArr[i].time
          ) {
            dataArr.splice(i + 1, 1);
          } else if (
            dataArr[i + 1].online === dataArr[i].online &&
            dataArr[i + 1].time !== dataArr[i].time
          ) {
            dataArr.splice(i + 1, 1);
          } else if (
            dataArr[i + 1].online === dataArr[i].online &&
            dataArr[i + 1].time === dataArr[i].time
          ) {
            dataArr.splice(i, 1);
          } else {
            return;
          }
        });
        dataArr.forEach((item, i) => {
          if (i > dataArr.length - 2) {
            return;
          }
          if (
            dataArr[i + 1].online !== dataArr[i].online &&
            dataArr[i + 1].time === dataArr[i].time
          ) {
            dataArr.splice(i + 1, 1);
          } else if (
            dataArr[i + 1].online === dataArr[i].online &&
            dataArr[i + 1].time !== dataArr[i].time
          ) {
            dataArr.splice(i + 1, 1);
          } else if (
            dataArr[i + 1].online === dataArr[i].online &&
            dataArr[i + 1].time === dataArr[i].time
          ) {
            dataArr.splice(i, 1);
          } else {
            return;
          }
        });
        dataArr.forEach((item) => {
          timeArr.push(item.time);
          statusArr.push(item.online);
        });
        this.timeArr = timeArr;
        this.statusArr = statusArr;
      });
    },
    sendBroadcast(obj) {
      this.broadcastVisible = true;
      this.broadId = obj.deviceId;
    },
    showLog(obj) {
      this.logVisible = true;
      const beginTime = this.timeSearch
        ? this.timeSearch[0] + " 00:00:00"
        : null;
      const endTime = this.timeSearch ? this.timeSearch[1] + " 23:59:59" : null;
      if (obj && typeof obj === "object" && obj.deviceId) {
        this.broadCode = obj.deviceId;
        this.pageOrder.currentPage = 1;
      } else if (typeof obj === "number") {
        this.pageOrder.currentPage = obj;
      }
      const parms = {
        beginTime,
        endTime,
        currentPage: this.pageOrder.currentPage,
        deviceId: this.broadCode,
        pageSize: this.pageSize,
        cmdType: 16
      };
      apis.getOrders(parms).then((res) => {
        this.tableOrderData = res.items;
        this.pageOrder.totalSize = res.totalRecords;
      });
    },
    exportLog() {
      this.isExportingLog = true;
      const beginTime = this.timeSearch
        ? this.timeSearch[0] + " 00:00:00"
        : null;
      const endTime = this.timeSearch ? this.timeSearch[1] + " 23:59:59" : null;
      const params = {
        beginTime,
        endTime,
        deviceId: this.broadCode,
      };
      apis.exportOrders({ ...params }).then((res) => {
        this.isExportingLog = false;
      });
    },
    cancelStatus() {
      this.statusVisible = false;
    },
    submitBroadcastForm() {
      this.loadingSubmit2 = true;
      apis.sendBroadcast(this.broadId, this.broadcastInfo).then((res) => {
        this.$message.success("广播成功");
        this.loadingSubmit2 = false;
        this.broadcastVisible = false;
      });
    },
    cancelBroadcastForm() {
      this.broadcastVisible = false;
      this.$refs["editForm2"].resetFields();
      this.broadcastInfo.message = "";
      this.loadingSubmit2 = false;
    },
    cancelLogPop() {
      this.logVisible = false;
    },
    sendAgain(obj) {
      this.$confirm("确认重新发送该命令?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          apis.sendOrderAgain(obj.id).then(res =>{
            this.$alert(res, '响应结果', {
              confirmButtonText: "确定",
              dangerouslyUseHTMLString: true,
            });
          });
        })
        .catch(() => {});
    },
    downTemplate(){
      apis.getBroadTemplate(this.itemCurrent).then(res =>{
        this.$message.success('下载成功');
      });
    },
  },
};
</script>

<style lang='less' scoped>
.form_gateway {
  margin: 1rem 1.3rem 0.6rem;
  .el-select {
    display: block;
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
.status_pop {
  .number_lists {
    margin: 1.2rem 0;
    color: #424242;
    display: flex;
    .list {
      margin-left: 1.4rem;
      width: 9rem;
      .q {
        margin-bottom: 0.6rem;
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
  .chart_box {
    overflow: hidden;
  }
}
</style>
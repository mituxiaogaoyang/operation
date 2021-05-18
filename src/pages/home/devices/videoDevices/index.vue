<template>
  <div class='video_device'>
    <tool-bar @changeArea="getTableByArea" @seachByWord="seachByWord" placeholder="设备序列号、设备名称、监测点名称">
      <!-- <template v-slot:searchBefore>
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
      </template> -->
      <template v-slot:btnBox>
        <el-button type="primary" icon="el-icon-plus" @click="addDevice">添加设备</el-button>
        <file-import name="视频设备" pathImport="video/import" @downTemplate="downTemplate" @importSuccess="getDeviceData"></file-import>
      </template>
    </tool-bar>
    <div class="table_containner">
      <div class="title_table">视频设备列表</div>
      <table-operation :tableData="tableData" :fields="fields" :operates="operates"
        :loadingTable="loadingTable"
        :currentPage="currentPage"
        :totalSize="totalSize"
        @changePage="getDeviceData">
      </table-operation>
    </div>
    <!-- 添加设备 -->
    <pop-box
      :title="isDeviceAdd?'添加视频设备':'编辑视频设备'"
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
          <el-form-item label="设备名称：" prop="videoName">
            <el-input v-model="deviceInfo.videoName"></el-input>
          </el-form-item>
          <el-form-item label="S/N号：" prop="videoCode">
            <el-input v-model="deviceInfo.videoCode" :disabled="!isDeviceAdd"></el-input>
          </el-form-item>
          <el-form-item label="appKey：" prop="appKey">
            <el-input v-model="deviceInfo.appKey"></el-input>
          </el-form-item>
          <el-form-item label="appSecret：" prop="appSecret">
            <el-input v-model="deviceInfo.appSecret"></el-input>
          </el-form-item>
          <el-form-item label="视频通道号：" prop="channelNo">
            <el-input type="number" v-model="deviceInfo.channelNo"></el-input>
          </el-form-item>
          <el-form-item label="设备验证码：" prop="verificationCode">
            <el-input v-model="deviceInfo.verificationCode"></el-input>
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
          <el-form-item label="生产厂商：" prop="manufacturer">
            <el-input v-model="deviceInfo.manufacturer"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </pop-box>
    <detail-pop :popShow="detailVisible" :detailInfo= "detailInfo"  @cancel="cancelDetail"></detail-pop>
    <!-- 视频云台控制 -->
    <pop-box
      title="视频云台控制"
      :popShow="videoControlVisible"
      :includeFooter="false"
      @cancel="cancelVideoControl"
      widthBox="45rem"
      class="video_pop"
    >
      <div class="video_container"><ys-video ref="ysVideo"  :params="videoInfo"></ys-video></div>
      <div class="funcs_box">
        <div class="directions">
          <div class="top" @click="goTop"><i class="el-icon-arrow-up"></i></div>
          <div class="right" @click="goRight"><i class="el-icon-arrow-right"></i></div>
          <div class="bottom" @click="goDown"><i class="el-icon-arrow-down"></i></div>
          <div class="left" @click="goLeft"><i class="el-icon-arrow-left"></i></div>
          <div class="center" @click="capture"><i class="el-icon-camera"></i></div>
        </div>
        <div class="zoom">
          <div class="plus" @click="zoomIn">＋</div>
          <div class="reduce" @click="zoomOut">-</div>
        </div>
      </div>
    </pop-box>
  </div>
</template>

<script>
  import tableOperation from "@/components/tableOperation.vue";
  import toolBar from "@/components/toolbar.vue";
  import popBox from "@/components/popbox.vue";
  import detailPop from "@/components/detailPop.vue";
  import ysVideo from "@/components/ysVideo"; //VideoPlayer
  import * as apis from "@/apis/api";
  import fileImport from '@/components/fileImport.vue';
  const status = [
    {label: '在线', value: '1'},
    {label: '离线', value: '0'},
  ];
  function requiredItem(msg = "该项不能为空") {
    const obj = { required: true, message: msg };
    return obj;
  }
  let idEdit;
  export default {
    name: "videoDevices",
    components: {
      tableOperation,
      toolBar,
      popBox,
      ysVideo,
      fileImport,
      detailPop
    },
    data () {
      return {
        statusOnline: '',
        statusDic:status,
        tableData:[],
        fields: [
          {
            prop: "videoCode",
            label: "设备序列号",
            minWidth: 4,
          },
          {
            prop: "videoName",
            label: "设备名称",
            minWidth: 4,
          },
          {
            prop: "manufacturer",
            label: "生产厂商",
            minWidth: 4,
          },
          {
            prop: "monitorName",
            label: "所属监测点",
            minWidth: 4,
          }
        ],
        operates: [
          {name: '云台控制', method: this.showVideoControl},
          {name: '编辑', method: this.editDevice},
          {name: "详情",method: this.showDetail,}, 
          {name: '删除', method: this.deleteDevice},
        ],
        currentPage: 1,
        totalSize: 0,
        editFormVisible: false,
        deviceInfo: {
          appKey:'',
          appSecret:'',
          channelNo:'',
          manufacturer:'',
          monitorCode:'',
          verificationCode:'',
          videoCode:'',
          videoName:'',
        },
        detailInfo: [
          {label:'videoName', name: '设备名称', v:''},
          {label:'videoCode', name: 'S/N号', v:''},
          {label:'manufacturer', name: '生产厂商', v:''},
          {label:'monitorName', name: '所属监测点', v:''},
          {label:'appKey', name: 'appKey', v:''},
          {label:'appSecret', name: 'appSecret', v:''},
          {label:'channelNo', name: '视频通道号', v:''},
          {label:'verificationCode', name: '设备验证码', v:''},
        ],
        deviceRules: {
          appKey: [requiredItem()],
          appSecret: [requiredItem()],
          channelNo: [requiredItem()],
          manufacturer: [requiredItem()],
          monitorCode: [requiredItem()],
          verificationCode: [requiredItem()],
          videoCode: [{ min:1,max:20, message: '输入字符不能超过20位', trigger: 'blur' },requiredItem()],
          videoName: [{ min:1,max:32, message: '输入字符不能超过32位', trigger: 'blur' },requiredItem()],
        },
        videoControlVisible: false,
        detailVisible: false,
        videoInfo: {
          videoCode: "", //序列号
          channelNo:'',
          verificationCode: '',
          appKey:'',
          appSecret: '',
        },
        monitors:[],
        isDeviceAdd: true,
        loadingSubmit: false,
        loadingTable: true,
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
    created(){
      this.getMonitors();
    },
    mounted () {
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
          onLineState: this.statusOnline.length?Number(this.statusOnline):'',
          pageSize: this.pageSize,
        };
        this.itemCurrent&&apis.getVideos(obj).then((res) => {
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
      addDevice(){
        this.editFormVisible =true;
        this.isDeviceAdd = true;
      },
      editDevice(obj){
        this.isDeviceAdd = false;
        idEdit = obj.id;
        apis.getVideoDetail(idEdit).then((res) => {
          this.editFormVisible = true;
          for (let k in this.deviceInfo) {
            this.deviceInfo[k] = res[k];
          }
        });
      },
      showDetail(obj) {
        apis.getVideoDetail(obj.id).then((res) => {
          this.detailVisible = true;
          for (let item of this.detailInfo) {
            item.v = res[item.label] || '暂无';
          }
        });
      },
      cancelDetail(){
        this.detailVisible = false;
      },
      showVideoControl(obj){
        this.videoControlVisible =true;
        apis.getVideoDetail(obj.id).then((res) => { 
          for(let k in this.videoInfo){
            this.videoInfo[k] = res[k];
          }
          console.log(this.$refs);
          console.log(this.videoInfo);
          this.ysInstance =  this.$refs.ysVideo.init();
        });
        
        // this.videoControlVisible =true;
        // this.videoInfo ={serialNo: "E65576019", channelNo:1,validateCode: 'UYBMPA'};
        // this.$refs.ysVideo && this.$refs.ysVideo.init();
      },
      deleteDevice(obj) {
        this.$confirm("确认删除该视频设备?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            apis.deleteVideo(obj.id).then((res) => {
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
            if (this.isDeviceAdd) {
              apis.addVideo({...this.deviceInfo,createProjectId: this.itemCurrent}).then((res) => {
                this.loadingSubmit = false;
                this.editFormVisible = false;
                this.$message.success("视频设备添加成功");
                this.getDeviceData();
              }).catch(() => {
                this.loadingSubmit = false;
              });
            } else {
              apis
                .updateVideo({ ...this.deviceInfo, id: idEdit,createProjectId: this.itemCurrent })
                .then((res) => {
                  this.loadingSubmit = false;
                  this.editFormVisible = false;
                  this.$message.success("视频设备修改成功");
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
      cancelEditForm(){
        this.$refs["editForm"].resetFields();
        this.editFormVisible =false;
        this.loadingSubmit = false;
        for(let k in this.deviceInfo){
          this.deviceInfo[k] = '';
        }
      },
      cancelVideoControl(){
        this.videoControlVisible =false;
        for(let k in this.videoInfo){
          this.videoInfo[k] = '';
        }
        console.log(this.ysInstance);
        this.$refs.ysVideo.destroyPlayer();
      },
      goTop(){
        this.$refs.ysVideo.up();
      },
      goRight(){
        this.$refs.ysVideo.right();
      },
      goDown(){
        this.$refs.ysVideo.down();
      },
      goLeft(){
        this.$refs.ysVideo.left();
      },
      capture(){
        this.$refs.ysVideo.capture();
      },
      zoomIn(){
        this.$refs.ysVideo.zoomIn();
      },
      zoomOut(){
        this.$refs.ysVideo.zoomOut();
      },
      downTemplate(){
        apis.getVideoTemplate(this.itemCurrent).then(res =>{
          this.$message.success('下载成功');
        });
      },
    }
  };
</script>

<style lang='less'>
.form_gateway{
  margin: 1rem 1.3rem 0.6rem;
  .el-select{
    display: block;
  }
}
.video_pop{
  .el-dialog__body{
    background-color: #eee;
    display: flex;
    justify-content: space-between;
  }
  .video_container{
    width:30rem;
    height:20rem;
  }
  .funcs_box{
    width:12rem;
    .directions{
      width:8rem;
      height:8rem;
      border-radius: 50%;
      background-color: #fff;
      margin:4rem auto 1rem;
      position: relative;
      >div{
        position: absolute;
        font-size: 1rem;
        cursor: pointer;
      }
      .top{
        top:0.3rem;
        left:3.5rem;
      }
      .right{
        right:0.3rem;
        top:3.5rem;
      }
      .bottom{
        bottom:0.3rem;
        left:3.5rem;
      }
      .left{
        left: 0.3rem;
        top: 3.5rem;
      }
      .center{
        left:2.5rem;
        top:2.5rem;
        width:3rem;
        height: 3rem;
        line-height: 2.8rem;
        text-align: center;
        background-color: #F5F5F5;
        border-radius: 50%;
      }
    }
    .zoom{
      width:8rem;
      height: 2rem;
      line-height: 2rem;
      background-color: #fff;
      border-radius: 1.2rem;
      margin:1.5rem auto;
      display: flex;
      justify-content: space-between;
      text-align: center;
      color:#7B849E;
      font-size: 1.2rem;
      position: relative;
      >div{
        width:49%;
        height:100%;
        cursor: pointer;
      }
      &::after{
        content:'';
        display: block;
        position: absolute;
        top:0;
        bottom:0;
        width:0.05rem;
        left:50%;
        background-color: #eee;
      }
    }
  }
}
</style>
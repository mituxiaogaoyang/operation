<template>
  <el-dropdown class="dropdown_import" @command="handleCommand">
    <el-upload
      class="avatar-uploader"
      :headers="{access_token: accessToken}"
      :action="apiPath + pathImport+ '?projectId=' +itemCurrent"
      :show-file-list="false"
      :on-success="handleImportSuccess"
      :on-error="uploadError"
      :before-upload="beforeImport">
      <el-button>导入{{name}}</el-button>
    </el-upload>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="down">模板下载</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
  import {apiPath} from "@/apis/api";
  import {refreshToken} from "@/apis/http";
  export default {
    components: {

    },
    computed: {
      itemCurrent() {
        return this.$store.state.itemCurrent;
      },
    },
    props:['name','pathImport'],
    data () {
      return {
        apiPath,
        accessToken:'',
      };
    },
    mounted () {
      this.accessToken = sessionStorage.getItem('accessToken');
    },
    methods: {
      handleCommand(c){
        if(c === 'down'){
          this.$emit('downTemplate');
        }
      },
      handleImportSuccess(res){
        if(res.result===200){
          this.$emit('importSuccess',1);
        }else{
          this.$message.warning((res.message||'上传异常')+'请重新上传');
        }
      },
      async beforeImport(){
        await refreshToken().then(res =>{
          this.accessToken = sessionStorage.getItem('accessToken');
        });
      },
      uploadError(err){
        this.$message.warning(err.message||'上传异常');
      }
    },
  };
</script>

<style lang='less' scoped>
.dropdown_import{
  margin-left:1rem;
}
</style>
<template>
  <div class='table_operation'>
    <el-table
      :data="tableData"
      :max-height="maxH"
      v-loading="loadingTable"
      style="width: 100%">
      <el-table-column align= "center" type="index" label="序号" :width="indexWidth"></el-table-column>
      <el-table-column align= "center" :label="list.label" :min-width="list.minWidth" v-for="list in fields" :key="list.prop" show-overflow-tooltip>
        <span slot-scope="scope" v-if="list.prop === 'status'" :class="scope.row[list.prop]">{{scope.row[list.prop]}}</span><!-- 在线离线状态-->
        <template slot-scope="scope" v-else>{{scope.row[list.prop]||scope.row[list.prop] === 0?  scope.row[list.prop]: '---'}}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align= "center"
        v-if="operates && operates.length"
        :min-width="3+operates.length*1.5">
        <template slot-scope="scope">
          <el-button v-for="operate in operates" :disabled="scope.row.cantOperate && operate.name==='数据流'" :key="operate.name" @click="(operate.method)(scope.row)" type="text">{{operate.name}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if= "includePage"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalSize">
    </el-pagination>
  </div>
</template>

<script>
  //import x from ''
  // 计算序号列的宽度
  function calcIndexWidth(){
    const deviceWidth = window.innerWidth;
    const widthDom = deviceWidth*68/1920 ;
    return widthDom.toFixed(2);
  }
  export default {
    props: {
      currentPage:Number,
      totalSize:Number,
      tableData: Array,
      fields: Array,
      operates: Array,
      loadingTable: {
        type: Boolean,
        default: false
      },
      includePage: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        indexWidth:80,
        maxH: 0,
      };
    },
    computed:{
      pageSizes(){
        return this.$store.state.pageSizes;
      },
      pageSize(){
        return this.$store.state.pageSize;
      }
    },
    mounted () {
      this.indexWidth = calcIndexWidth();
      window.addEventListener('resize', this.getElHeight);
    },
    watch:{
      tableData(nV){
        this.getElHeight();
      },
      '$route.path'(){
        this.getElHeight();
      }
    },
    methods: {
      getElHeight(){ 
        const parent = this.$el.parentNode;
        const title = parent.querySelector('.title_table');
        const pagination = parent.querySelector('.el-pagination');
        const toobar = parent.querySelector('.tool_bar');
        const containerH = parent.clientHeight;
        let h = containerH;
        
        if(title){
          const titleH = title.clientHeight;
          h = h - titleH;
        }
        if(pagination){
          const pageH = pagination.clientHeight;
          h = h - pageH;
        }
        if(toobar){
          const toolbarH = toobar.clientHeight;
          h = h - toolbarH;
        }
        this.maxH = h;
        this.indexWidth = calcIndexWidth();
      },
      handleSizeChange(val){
        this.$store.commit('changePageSize', val);
      },
      handleCurrentChange(page){
        this.$emit('changePage',page);
      }
    },
    destroyed(){
      window.removeEventListener('resize', this.getElHeight);
    }
  };
</script>

<style lang='less' scoped>
.el-table .cell .el-button{
  padding:0.1rem;
}
.el-button + .el-button{
  margin-left:0.4rem;
}
</style>
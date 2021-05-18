<template>
    <el-dialog
      title="详情"
      :visible.sync="detailVisible"
      width="24rem"
      :close-on-click-modal= false
      append-to-body
       @close= "cancelPop"
      >
      <div class="detail_lists">
        <div class="list" v-for="item in detailInfo" :key="item.label">
          <div class="label">{{item.name}}：</div>
          <div class="value">{{item.v}}</div>
        </div>
        <slot></slot>
      </div>
    </el-dialog>
</template>
<script>
  //import x from ''
  export default {
    props:{popShow:Boolean, detailInfo:Array},
    data () {
      return {
        detailVisible: false
      };
    },
    computed: {
      
    },
    watch: {
      popShow(nV){
        this.detailVisible = nV;
      }
    },
    mounted () {

    },
    methods: {
      cancelPop(){
        this.$emit('cancel');
      },
    },
  };
</script>

<style lang='less'>
.detail_lists{
  margin:1rem 0 2rem;
  .list{
    padding:0.6rem 0;
    position: relative;
    border-bottom: 0.06rem solid rgba(0,0,0,.1);
  }
  .label{
    width:5.8rem;
    position: absolute;
    left:0;
    top:0.6rem;
    text-align: right;
    color:#999;
  }
  .value{
    margin-left:6.2rem;
    .el-button{
      padding:0;
      text-overflow: ellipsis;
      width: 15rem;
      white-space: nowrap;
      overflow-x: hidden;
      line-height: 1.5;
      word-break: break-all;
      text-align: left;
    }
  }
}
</style>
<template>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :width="widthBox"
      :close-on-click-modal= false
      append-to-body
      @close= "cancelPop"
      >
      <slot></slot>
      <span slot="footer" class="dialog-footer" v-if="includeFooter">
        <el-button @click="cancelPop">取 消</el-button> 
        <el-button type="primary" @click="surePop" :loading="isSubmiting">确 定</el-button>      
      </span>
    </el-dialog>
</template>

<script>
  //import x from ''
  export default {
    components: {

    },
    props:{
      title: String,
      widthBox:{
        type: String,
        default: '24rem'
      },
      popShow: Boolean,
      includeFooter: {
        type: Boolean,
        default: true
      },
      isSubmiting: {
        type: Boolean,
        default: false
      },
    },
    data () {
      return {
        dialogVisible: false
      };
    },
    computed: {
      
    },
    watch: {
      popShow(nV){
        this.dialogVisible = nV;
      }
    },
    mounted () {

    },
    methods: {
      cancelPop(){
        this.$emit('cancel');
      },
      surePop(){
        this.$emit('submit');
      }
    },
  };
</script>

<style lang='less' scoped>

</style>
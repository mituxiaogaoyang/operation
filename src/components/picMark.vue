<template>
  <el-dialog
    class="pic-mark-dialog"
    :title="'平面图标注'+(editable?'（鼠标左击确定位置）':'')"
    :visible.sync="showPopup"
    :width="width||'40rem'"
    :append-to-body="true"
  >
    <div class="img-con" @mouseenter="start" @mousemove="move">
      <img :src="ossPrefix + picUrl" />
      <i class="point" :style="{left: x, top: y}" @click="sure"></i>
    </div>
  </el-dialog>
</template>

<script>
function getDomSize(dom) {
  return { width: dom.clientWidth || dom.offsetWidth, height: dom.clientHeight || dom.offsetHeight };
}
import {attach_server} from "@/apis/api";
export default {
  name: "pic-mark",
  props: ["picUrl", "width", "showX", "showY", "editable"],
  data() {
    return {
      showPopup: false,
      x: "",
      y: "",
      ossPrefix: attach_server
    };
  },
  watch: {
    showPopup(val) {
      if (val) {
        this.x = !this.showX ? "" : this.showX * 100 + "%";
        this.y = !this.showY ? "" : this.showY * 100 + "%";
      }
    },
  },
  methods: {
    show() {
      this.showPopup = true;
    },
    hide() {
      this.showPopup = false;
    },
    start(e) {
      if (this.editable) {
        const dialog = this.$el.querySelector(".el-dialog");
        const imgCon = dialog.querySelector(".img-con");
        this.x = e.x - dialog.offsetLeft - imgCon.offsetLeft + "px";
        this.y = e.y - dialog.offsetTop - imgCon.offsetTop + "px";
        // this.startX = e.x;
        // this.startY = e.y;
        // this.x = e.offsetX + 'px';
        // this.y = e.offsetY + 'px';
      }
    },
    move(e) {
      if (this.editable) {
        const dialog = this.$el.querySelector(".el-dialog");
        const imgCon = dialog.querySelector(".img-con");
        this.x = e.x - dialog.offsetLeft - imgCon.offsetLeft + "px";
        this.y = e.y - dialog.offsetTop - imgCon.offsetTop + "px";
        // this.x = parseFloat(this.x) + e.x - this.startX + 'px';
        // this.y = parseFloat(this.y) + e.y - this.startY + 'px';
        // this.startX = e.x;
        // this.startY = e.y;
      }
    },
    sure(e) {
      if (this.editable) {
        const { width, height } = getDomSize(
          this.$el.querySelector(".img-con")
        );
        this.$emit("on-change", {
          x: parseFloat(this.x) / width,
          y: parseFloat(this.y) / height,
        });
        this.hide();
      }
    },
  },
};
</script>

<style lang="less">
.pic-mark-dialog {
  .el-dialog__body {
    text-align: center;
    .img-con {
      max-width: 100%;
      display: inline-block;
      position: relative;
      overflow: hidden;
      img {
        vertical-align: top;
        max-width: 100%;
      }
      .point {
        position: absolute;
        top: -50px;
        left: -50px;
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
  }
}
</style>
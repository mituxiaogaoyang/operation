<template>
  <div class="ys-video">
    <video v-if="mode === 'live'" class="ys-video-player" controls playsInline  webkit-playsinline></video>
    <div v-else class="video-player-container" :id="'video-player-container-' + params.videoCode"></div>
    <remote-js src="/ezuikit.js"></remote-js>
  </div>
</template>
<script>
import YsApi from './api';
// status 地址使用状态：0-未使用或直播已关闭，1-使用中，2-已过期，3-直播已暂停，0状态不返回地址，其他返回
// exception 地址异常状态：0-正常，1-设备不在线，2-设备开启视频加密，3-设备删除，4-失效，5-未绑定，6-账户下流量已超出，7-设备接入限制，0/1/2/6状态返回地址，其他不返回
function isFunction (param) {
  const objToString = Object.prototype.toString;
  return objToString.call(param) === '[object Function]';
}
function getDomSize(dom) {
  return { width: dom.clientWidth || dom.offsetWidth, height: dom.clientHeight || dom.offsetHeight };
}
function format(str, arg) {
  var date = null;
  if (this instanceof Date) {
    date = this;
  } else if (/^1[0-9]{12}/g.test(arg)) {
    date = new Date(Number(arg));
  }else if(arg instanceof Date){
    date = arg;
  } else if (typeof arg === 'string') {
    const d = new Date(arg);
    !Number.isNaN(d.getDay()) && (date = d);
  }
  if (!date) {
    throw Error('timeUtil.parseStr参数异常');
  }
  !str && (str = 'yyyy-MM-dd');
  var resultArr = str.match(/([a-zA-Z]{1,}|[^a-zA-Z]{1,})/g),
    reg = /^[a-zA-Z]/g,
    resultStr = '',
    mode = '';
  resultArr && resultArr.forEach((item) => {
    if (reg.test(item)) {
      var obj = getItemValue(date, item);
      obj.mode && (mode = obj.mode);
      resultStr += obj.text;
    } else {
      resultStr += item;
    }
  });
  return resultStr + mode;
}
export default {
  name: 'ys-video', // 萤石开发平台视频接入组件
  components: {
    'remote-js': {
      render(createElement){
        return createElement('script', {attrs: {
          type: 'text/javascript',
          src: this.src
        }, props: {
          src: {type: String, required: true}
        }});
      }
    }
  },
  props: {
    params: {
      type: Object,
      default: ()=>{},
      required: true
    },
    mode: {
      type: String,
      default: 'live'
    },
    // 是否是高清画质
    isHD: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
    };
  },
  created(){
    this.elem = null;
    this.player = null;
  },
  mounted(){
    this.elem = this.$el.querySelector('.ys-video-player');
    this.params.serialNo && this.params.channelNo && this.init();
  },
  beforeDestroy(){
    this.destroyPlayer();
  },
  methods: {
    init(success){
      if (!this.params.appKey || !this.params.appSecret || !this.params.videoCode) {
        this.$message.error('参数缺失，无法开启视频监控');
        return;
      }
      this.ysApi && this.destroyPlayer();
      // 初始化播放
      const ysApi = new YsApi({
        appKey: this.params.appKey,
        appSecret: this.params.appSecret,
        // 直连摄像机时只有一条通道
        deviceSerial: this.params.videoCode,
        channelNo: this.params.channelNo,
        validateCode: this.params.verificationCode // 球体摄像机设备验证码
      });
      this.ysApi = ysApi ;
      if(typeof EZUIKit !== 'undefined'){
        if (this.mode === 'live') {
          ysApi.getUrl(this.params.videoCode, this.params.channelNo).then(res => {
            this.$nextTick(() => {
              this.elem = this.$el.querySelector('.ys-video-player');
              const elem_clone = this.elem.cloneNode();
              elem_clone.className += ' ys-video-player-clone';
              elem_clone.id = 'ys-video-player-clone' + this._uid;
              elem_clone.autoplay = true;
              const source = document.createElement('source');
              source.src = res.hdAddress;
              // source.type = 'rtmp/flv';
              elem_clone.appendChild(source);
              // elem_clone.src = res.rtmpHd;
              this.$el.appendChild(elem_clone);
              this.player = new EZUIKit.EZUIPlayer(elem_clone.id);
              isFunction(success) && success(ysApi, this.player);
            });
          }).catch(err => {
            //
          });
        } else {
          if (!this.params.verificationCode) {
            this.$message.error('参数缺失，无法开启视频监控');
            return;
          }
          // 监控模式
          ysApi.getToken().then(res => {
            const id = 'video-player-container-' + this.params.videoCode;
            let url = `ezopen://${ysApi.validateCode}@open.ys7.com/${ysApi.deviceSerial}/${ysApi.channelNo}`;
            if (Array.isArray(this.params.dateRange) && this.params.dateRange.length === 2) {
              const dateStr = `begin=${format('yyyy-MM-dd~HH:mm:ss', this.params.dateRange[0])}Z&end=${format('yyyy-MM-dd~HH:mm:ss', this.params.dateRange[1])}Z`;
              url += `.rec?${dateStr.replace(/[-:]/g, '').replace(/~/g, 'T')}`;
            } else {
              url += `${this.isHD ? '.hd' : ''}.live`;
            }
            const { width: w, height: h } = getDomSize(document.getElementById(id).parentNode);
            const playParams = {
              id: id,
              url: url,
              autoplay: false,
              accessToken: ysApi.accessToken,
              decoderPath: './ezuikit',
              width: w,
              height: h,
              splitBasis: 1,
              handleError: ({ retcode }) => {
                retcode === 1003 && player.rePlay(playParams);
              }
            };
            const player = this.player = new EZUIKit.EZUIPlayer(playParams);
            ysApi.getPlayer = function () {
              return player;
            };
            player.play();
            ysApi.onresize = () => {
              setTimeout(() => {
                const { width, height } = getDomSize(document.getElementById(id).parentNode);
                player.reSize(width, height);
              }, 100);
            };
            window.addEventListener('resize', ysApi.onresize);
            isFunction(success) && success(ysApi, player);
          }).catch(err => {
            //
          });
        }
        return ysApi;
      }else{
        setTimeout(this.init.bind(this), 1000);
      }
    },
    up(){
      this.ysApi.ctrlMove('up').then(res => {
        console.log('up', res);
      });
    },
    down(){
      this.ysApi.ctrlMove('down').then(res => {
        console.log('down', res);
      });
    },
    left(){
      this.ysApi.ctrlMove('left').then(res => {
        console.log('left', res);
      });
    },
    right(){
      this.ysApi.ctrlMove('right').then(res => {
        console.log('right', res);
      });
    },
    capture(){
      this.ysApi.capture().then(res => {
        console.log('capture', res);
        window.open(res.picUrl);
      });
    },
    zoomIn () {
      this.ysApi.ctrlMove('zoomIn').then(res => {
        console.log('zoomIn', res);
      });
    },
    zoomOut () {
      this.ysApi.ctrlMove('zoomOut').then(res => {
        console.log('zoomOut', res);
      });
    },
    destroyPlayer () {
      if (this.mode === 'live') {
        if(this.player){
          this.player.stop();
          const elem_clone = document.getElementById('ys-video-player-clone' + this._uid);
          elem_clone && this.$el.removeChild(elem_clone);
        }
      } else {
        if (!this.params.videoCode || !this.ysApi || !this.player) return;
        const elem = this.$el.querySelector('.video-player-container');
        elem.querySelectorAll('.parent-wnd').forEach(node => {
          elem.removeChild(node);
        });
        const loading = this.$el.querySelector('.loading-container');
        if (loading) {
          const parentNode = elem.parentNode;
          parentNode.removeChild(loading);
        }
        window.removeEventListener('resize', this.ysApi.onresize);
        this.player.stop();
        this.player.destroy();
      }
      this.ysApi && this.ysApi.destroy();
      this.player = null;
      this.ysApi = null;
    }
  }
};
</script>
<style lang="less">
.ys-video{
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  padding-bottom: 40px;
  overflow: hidden;
  .ys-video-player{
    display: none;
  }
  .video-player-container {
    width: 100%;
    height: 100%;
  }
  .parent-wnd{
    color:#fff;
    >div{
      width:100%!important;
      height: 100%!important;
      canvas{
        width:100%!important;
        height: 100%!important;
      }
    }
  }
  video[id^="ys-video-player-clone"]{
    display: inline-block;
    width: 100%;
    height: 100%;
    vertical-align: middle;
  }
  .toolbar{
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40px;
    .ivu-btn{
      margin-right: 10px;
    }
    .iconfont{
      display: inline-block;
    }
    .down{
      .iconfont{
        transform: rotate(180deg);
      }
    }
    .left{
      .iconfont{
        transform: rotate(-90deg);
      }
    }
    .right{
      .iconfont{
        transform: rotate(90deg);
      }
    }
  }
}
</style>
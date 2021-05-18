<template>
  <div class="video-player">
    <i
      class="iconfont"
      v-if="showFullscreen"
      :class="isFullscreen ? 'iconexit-fullscreen' : 'iconfullscreen'"
      @click="toggleFullscreen($event)"
    ></i>
    <video v-if="mode === 'live'" class="ys-video-player" controls playsinline webkit-playsinline></video>
    <div v-else class="video-player-container" :id="'video-player-container-' + params.videoCode"></div>
  </div>
</template>

<script>
import { isFunction } from '@/libs/util/type';
import { getDomSize, fullscreen, exitFullscreen } from '@/libs/util/dom';
import { format } from '@/libs/util/time';
import YsApi from '@/api/ysApi';
export default {
  name: 'video-player',
  // props: ['appKey', 'appSecret', 'videoCode', 'channelNo', 'verificationCode', 'dateRange'],
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    showFullscreen: {
      type: Boolean,
      default: false
    },
    // 播放模式：live直播，monitor监控
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
  data () {
    return {
      isFullscreen: false
    }
  },
  created () {
    this.elem = null;
    this.player = null;
  },
  beforeDestroy () {
    this.destroyPlayer();
  },
  methods: {
    connect (success) {
      if (!this.params.appKey || !this.params.appSecret || !this.params.videoCode) {
        this.$message.error('参数缺失，无法开启视频监控');
        return;
      }
      this.ysApi && this.destroyPlayer();
      // 初始化播放
      const ysApi = this.ysApi = new YsApi({
        appKey: this.params.appKey,
        appSecret: this.params.appSecret,
        // 直连摄像机时只有一条通道
        deviceSerial: this.params.videoCode,
        channelNo: this.params.channelNo,
        validateCode: this.params.verificationCode // 球体摄像机设备验证码
      });
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
          })
        }).catch(err => {
          //
        })
      } else {
        if (!this.params.verificationCode) {
          this.$message.error('参数缺失，无法开启视频监控');
          return
        }
        // 监控模式
        ysApi.getToken().then(res => {
          const id = 'video-player-container-' + this.params.videoCode;
          let url = `ezopen://${ysApi.validateCode}@open.ys7.com/${ysApi.deviceSerial}/${ysApi.channelNo}`;
          if (Array.isArray(this.params.dateRange) && this.params.dateRange.length === 2) {
            const dateStr = `begin=${format('yyyy-MM-dd~HH:mm:ss', this.params.dateRange[0])}Z&end=${format('yyyy-MM-dd~HH:mm:ss', this.params.dateRange[1])}Z`
            url += `.rec?${dateStr.replace(/[-:]/g, '').replace(/\~/g, 'T')}`;
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
          }
          const player = this.player = new EZUIKit.EZUIPlayer(playParams)
          ysApi.getPlayer = function () {
            return player
          }
          player.play()
          ysApi.onresize = () => {
            setTimeout(() => {
              const { width, height } = getDomSize(document.getElementById(id).parentNode)
              player.reSize(width, height)
            }, 100)
          }
          window.addEventListener('resize', ysApi.onresize)
          isFunction(success) && success(ysApi, player)
        }).catch(err => {
          //
        })
      }
      return ysApi
    },
    destroyPlayer () {
      if (this.mode === 'live') {
        if(this.player){
          this.player.stop()
          const elem_clone = document.getElementById('ys-video-player-clone' + this._uid)
          elem_clone && this.$el.removeChild(elem_clone)
        }
      } else {
        if (!this.params.videoCode || !this.ysApi || !this.player) return
        const elem = this.$el.querySelector('.video-player-container')
        elem.querySelectorAll('.parent-wnd').forEach(node => {
          elem.removeChild(node)
        })
        const loading = this.$el.querySelector('.loading-container')
        if (loading) {
          const parentNode = elem.parentNode
          parentNode.removeChild(loading)
        }
        window.removeEventListener('resize', this.ysApi.onresize)
        this.player.stop()
        this.player.destroy()
      }
      this.ysApi && this.ysApi.destroy()
      this.player = null
      this.ysApi = null
    },
    toggleFullscreen (event) {
      if (this.isFullscreen === true) {
        this.isFullscreen = false
        exitFullscreen()
      } else {
        this.isFullscreen = true
        fullscreen((event.srcElement || event.target || event.toElement).parentNode)
      }
    }
  }
}
</script>

<style lang="scss">
.video-player {
  width: 600px;
  height: 400px;
  position: relative;
  overflow: hidden;

  .iconfont {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    color: #2ae9f8;
  }

  .video-player-container {
    width: 100%;
    height: 100%;
  }

  .ys-video-player {
    display: none;
  }
  video[id^="ys-video-player-clone"] {
    display: inline-block;
    width: 100%;
    height: 100%;
    vertical-align: middle;
  }
}
</style>

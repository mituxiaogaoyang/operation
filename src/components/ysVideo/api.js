// 空实例，用于api中统一处理时的消息提示
import Vue from 'vue';
import axios from 'axios';
const vue = new Vue();

// 异常统一处理函数
function exceptionHandler (code, message) {
  if (code === '20014') {
    message && vue.$message.error(message);
  }
}

const host = 'https://open.ys7.com';
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

const directionMap = {
  up: 0,
  down: 1,
  left: 2,
  right: 3,
  leftUp: 4,
  leftDown: 5,
  rightUp: 6,
  rightDown: 7,
  zoomIn: 8, // 放大
  zoomOut: 9, // 缩小
  focused: 10, // 近聚焦
  farFocus: 11 // 远聚焦
};

const speedMap = {
  slow: 0,
  normal: 1,
  quick: 2
};

// 萤石api类
export default class YsApi {
  appKey = ''
  appSecret = ''
  deviceSerial = ''
  channelNo = 1
  validateCode = ''
  accessToken = ''
  expireTime = 0

  constructor ({ appKey, appSecret, deviceSerial, channelNo, validateCode }) {
    this.updateData({ appKey, appSecret, deviceSerial, channelNo, validateCode });
  }

  updateData ({ appKey, appSecret, deviceSerial, channelNo, validateCode }) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.deviceSerial = deviceSerial;
    this.channelNo = channelNo || 1;
    this.validateCode = validateCode;
    this.accessToken = '';
    this.expireTime = 0;
  }

  // 获取token
  getToken () {
    const _this = this;
    return new Promise((resolve, reject) => {
      axios.request(`${host }/api/lapp/token/get`, {
        method: 'post',
        headers: headers,
        data: `appKey=${ _this.appKey }&appSecret=${ _this.appSecret}`
      })
        .then(res => res.data)
        .then(res => {
          if (res.code === '200') {
            _this.accessToken = res.data.accessToken;
            _this.expireTime = res.data.expireTime;
            resolve(res.data);
          }
        });
    });
  }

  // 获取视频地址
  async getUrl () {
    (!this.accessToken || this.expireTime + 30 * 1000 <= Date.now()) && await this.getToken();
    const _this = this;
    return new Promise((resolve, reject) => {
      axios.request(`${host }/api/lapp/live/address/limited`, {
        method: 'post',
        headers: headers,
        data: `accessToken=${ _this.accessToken }&deviceSerial=${ _this.deviceSerial }&channelNo=${ _this.channelNo}`
      })
        .then(res => res.data)
        .then(res => {
          if (res.code === '200') {
            resolve(res.data);
          } else {
            exceptionHandler(res.code, res.msg);
          }
        });
    });
  }

  // 关闭视频加密
  async setEncryptOff (validateCode) {
    (!this.accessToken || this.expireTime + 30 * 1000 <= Date.now()) && await this.getToken();
    const _this = this;
    return new Promise((resolve, reject) => {
      axios.request(`${host }/api/lapp/device/encrypt/off`, {
        method: 'post',
        headers: headers,
        data: `accessToken=${ _this.accessToken }&deviceSerial=${ _this.deviceSerial }&validateCode=${ validateCode}`
      })
        .then(res => res.data)
        .then(res => {
          if (res.code === '200') {
            resolve(res.data);
          }
        });
    });
  }

  // 控制云台移动，注意：开启后会一致移动，需要调用接口停止移动
  async ctrlMove (direction = 'up', speed = 'normal') {
    (!this.accessToken || this.expireTime + 30 * 1000 <= Date.now()) && await this.getToken();
    const _this = this;
    speed = speedMap[speed];
    return new Promise((resolve, reject) => {
      axios.request(`${host }/api/lapp/device/ptz/start`, {
        method: 'post',
        headers: headers,
        data: `accessToken=${ _this.accessToken }&deviceSerial=${ _this.deviceSerial }&channelNo=${ _this.channelNo }&direction=${ directionMap[direction] }&speed=${ speed}`
      })
        .then(res => res.data)
        .then(res => {
          if (res.code === '200') {
            setTimeout(() => {
              _this.ctrlStop(direction);
            }, 1000);
            resolve(res.data);
          }
        })
        .catch(err => vue.$message.warning('操作失败'));
    });
  }

  // 控制云台停止移动，调用其他接口时必须先停止云台控制
  async ctrlStop (direction = 'up') {
    (!this.accessToken || this.expireTime + 30 * 1000 <= Date.now()) && await this.getToken();
    const _this = this;
    direction = directionMap[direction];
    return new Promise((resolve, reject) => {
      axios.request(`${host }/api/lapp/device/ptz/stop`, {
        method: 'post',
        headers: headers,
        data: `accessToken=${ _this.accessToken }&deviceSerial=${ _this.deviceSerial }&channelNo=${ _this.channelNo }&direction=${ direction}`
      })
        .then(res => res.data)
        .then(res => {
          if (res.code === '200') {
            resolve(res.data);
          }
        });
    })
      .catch(err => vue.$message.warning('操作失败'));
  }

  // 设备抓拍图片
  async capture () {
    (!this.accessToken || this.expireTime + 30 * 1000 <= Date.now()) && await this.getToken();
    const _this = this;
    return new Promise((resolve, reject) => {
      axios.request(`${host }/api/lapp/device/capture`, {
        method: 'post',
        headers: headers,
        data: `accessToken=${ _this.accessToken }&deviceSerial=${ _this.deviceSerial }&channelNo=${ _this.channelNo}`
      })
        .then(res => res.data)
        .then(res => {
          if (res.code === '200') {
            resolve(res.data);
          }
        });
    })
      .catch(err => vue.$message.warning('操作失败'));
  }

  destroy () {
    this.appKey = null;
    this.appSecret = null;
    this.deviceSerial = null;
    this.channelNo = null;
    this.accessToken = null;
    this.expireTime = null;
    this.getToken = null;
    this.getUrl = null;
    this.setEncryptOff = null;
    this.ctrlMove = null;
    this.ctrlStop = null;
    this.capture = null;
  }
}
/*
 * @Author: renfeng 
 * @Date: 2020-09-07 09:38:22 
 * @Last Modified by: renfeng
 * @Last Modified time: 2020-09-14 17:22:43
 */
import axios from 'axios';
import {
  Message
} from 'element-ui';
import apiService, {
  storeToken,
  removeToken
} from './http';

export function loginIn(name, pwd) {
  axios.post('/apiPath/auth/login', {
    "password": pwd,
    "username": name
  }).then(res => {
    const dataRes = res.data;
    if (dataRes.result === 200) {
      storeToken(dataRes.data.token, dataRes.data.refreshToken);
      sessionStorage.setItem('username', dataRes.data.account);
      sessionStorage.setItem('maintenanceName', dataRes.data.maintenanceName);
      sessionStorage.setItem('expiration', dataRes.data.expiration);
      sessionStorage.setItem('provinceId', dataRes.data.provinceId);
      const origin = window.location.origin;
      window.location = origin;
      //location.href = location.protocol + '//' + location.host + '/acquisition.html';
    } else {
      Message({
        type: 'error',
        message: dataRes.message || '登录失败，请重新登录'
      });
    }

  }).catch(err =>{
    const message = err.response.data.message || '登录失败';
    Message.error(message);
  });
}
export function loginOut() {
  // apiService.get('/apiPath/logout').then(res => {
  //   removeToken();
  //   location.href = location.protocol + '//' + location.host + '/login.html';
  // });
  removeToken();
  sessionStorage.removeItem('maintenanceName');
  location.href = location.protocol + '//' + location.host + '/login.html';
}
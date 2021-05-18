/*
 * @Author: renfeng 
 * @Date: 2020-07-16 15:31:08 
 * @Last Modified by: renfeng
 * @Last Modified time: 2020-09-04 17:45:38
 */
import axios from 'axios'
import {
    Message
} from 'element-ui'

const apiContextPath_auth = '/apiPathLogin' // 登录认证

let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'token': ''
}
export function storeToken(accessToken, refreshToken) {
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', refreshToken)
}
export function removeToken() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
}

function getToken() {
    const userToken = {
        accessToken: sessionStorage.getItem('accessToken'),
        refreshToken: sessionStorage.getItem('refreshToken')
    }
    return userToken
}
let flagException = false //是否有异常提示，防止页面同时存在多个异常提示
function exceptionHandler(code, message) {
    if (flagException) return
    flagException = true
    setTimeout(() => {
        flagException = false
    }, 3000)
    if (code === 401 || code === -4 || code === -5) {
        Message({
            type: 'error',
            message: '登录失效请重新登录'
        })
        setTimeout(function () {
            removeToken()
            location.href = location.protocol + '//' + location.host + '/login.html'
        }, 1000)
    } else {
        message && Message({
            type: 'error',
            message: message
        })
    }
}
let expiration = sessionStorage.getItem('expiration') //token过期时间
function refreshToken() {
    const userToken = getToken()
    headers.refreshToken = userToken.refreshToken
    // headers.token = userToken.accessToken
    return new Promise((resolve) => {
        axios.request(apiContextPath_auth + '/auth', {
            headers: headers,
            method: 'get',
            data: JSON.stringify({
                token: userToken.accessToken,
                refreshToken: userToken.refreshToken
            })
        }).then(result => {
            const res = result.data
            if (res.result === 0) {
                expiration = res.data.tokenExpiration
                sessionStorage.setItem('expiration', expiration)
                storeToken(res.data.token, res.data.refreshToken)
                resolve()
            } else {
                exceptionHandler(res.result, res.message);
            }
        }).catch(err => {
            err.response.status === 500 && exceptionHandler(500, '服务异常！')
        })
    })
}

function openFile(url, filename, target) {
    let link = document.createElement('a')
    link.setAttribute('id', 'simulate_a_clickEvent')
    link.setAttribute('href', url)
    target && link.setAttribute('target', target)
    filename && link.setAttribute('download', filename)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
export async function apiAxios(options) {
    const timeNow = Date.now()
    if (!expiration || timeNow > expiration) {
        await refreshToken()
    }
    const userToken = getToken()
    headers.token = userToken.accessToken
    delete headers.refreshToken
    options.headers = headers
    return new Promise((resolve, reject) => {
        axios.request(options)
            .then(result => {
                const res = result.data

                if (options.responseType == 'blob') { //download
                    let filename;
                    if (result.headers['content-disposition']) {
                        filename = result.headers['content-disposition'];
                        filename = filename && filename.split(';')[1];
                        filename = filename && filename.split('=')[1];
                        filename = filename && decodeURIComponent(filename).replace(/\+/g, ' ');
                        filename = filename && filename.replace(/\"/g, '');
                    } else {
                        filename = 'download.xls';
                    }
                    try {
                        let str = JSON.parse(res);
                        exceptionHandler(500, '下载失败');
                        reject();
                    } catch (e) {
                        const href = window.URL.createObjectURL(res);
                        openFile(href, filename);
                        resolve(href);
                    }
                } else {

                    if (res && res.result === 0) {
                        resolve(res.data)
                    } else {
                        res && exceptionHandler(res.result, res.message || '服务异常')
                        reject()
                    }
                }

            }).catch(error => {

                const res = error.response
                res && exceptionHandler(res.status || 500, '服务异常');
                reject()
            })
    })

}

export default {
    get: (url, data) => {
        let options = {
            url,
            method: 'get'
        }
        data && (options.params = data)
        return apiAxios(options)
    },
    post: (url, data) => {
        let options = {
            url,
            method: 'post'
        }
        data && (options.data = JSON.stringify(data))
        return apiAxios(options)
    },
    put: (url, data) => {
        let options = {
            url,
            method: 'put'
        }
        data && (options.data = JSON.stringify(data))
        return apiAxios(options)
    },
    delete: (url, data) => {
        let options = {
            url,
            method: 'delete'
        }
        data && (options.params = data)
        return apiAxios(options)
    },
    download: (url, data, method) => {
        let options = {
            url,
            method: method || 'get',
            responseType: 'blob'
        }
        if (data) {
            if (options.method === 'get') {
                options.params = data
            } else {
                options.data = JSON.stringify(data)
            }
        }
        return apiAxios(options)
    }
}
//百度地图
const keyBd = 'WNBKTZ6rkImcF8IoOtL0GKwpDQ3Iq9aa'; //百度密钥

export function getCoordByName(provinceName, cityName, districtName) {
    const lengthArg = arguments.length;
    let url;
    if (lengthArg === 3) {
        url = `/mapBaidu?address=${districtName}&output=json&key=${keyBd}&city=${cityName}`;
    } else if (lengthArg === 2) {
        url = `/mapBaidu?address=${cityName}&output=json&key=${keyBd}&city=''`;
    } else {
        url = `/mapBaidu?address=${provinceName}&output=json&key=${keyBd}&city=''`;
    }

    function getCoord(resolve, reject) {
        axios.get(url).then(res => {
            if (res && res.data && res.data.result) {
                resolve(res.data.result.location)
            } else {
                console.error('未获取到经纬度')
            }
        }).catch(err => {
            console.log(err)
        })
    }
    return new Promise(getCoord)

}
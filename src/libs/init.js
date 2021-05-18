/*
 * @Author: renfeng 
 * @Date: 2020-07-15 15:12:15 
 * @Last Modified by: renfeng
 * @Last Modified time: 2020-09-11 13:57:27
 */
//设置根元素字体大小
const html = document.querySelector('html');
calcFontSize();
window.addEventListener("resize",calcFontSize);
function calcFontSize(){
  const docWidth = window.innerWidth;
  html.style.fontSize = (docWidth*20/1920).toFixed(2) + 'px';
}

//计算dom width
export function getDomWidth(dom) {
  return dom.clientWidth || dom.offsetWidth;
}
export function getDomHeight(dom) {
  return dom.clientHeight || dom.offsetHeight;
}
export function getDomSize(dom) {
  return { width: getDomWidth(dom), height: getDomHeight(dom) };
}
function add0(m){
  return m<10?'0'+m:m ;
}
export function stampToYMD(timestamp){ //时间戳转年月日
  var time = new Date(timestamp);
  var year = time.getFullYear();
  var month = time.getMonth()+1;
  var date = time.getDate();
  return year+'-'+add0(month)+'-'+add0(date);
}
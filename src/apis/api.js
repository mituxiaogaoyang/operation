/*
 * @Author: renfeng 
 * @Date: 2020-09-07 11:53:44 
 * @Last Modified by: renfeng
 * @Last Modified time: 2020-10-16 14:59:29
 */
import  apiService from './http';
export const apiPath = '/apiPath/';
export const attach_server = '/attach-server/';
//dict
export function getDict(type){
  return apiService.get(apiPath+ 'baseDic/find/'+type);
}
//省市区
export function getProvinces(){
  return apiService.get(apiPath+ 'baseArea/all/provinces');
}
export function getCities(id){
  return apiService.get(apiPath+ 'baseArea/query/parent/id',{parentId: id});
}
//模板下载
export function getJcdTemplate(projectId){
  if(projectId){
    return apiService.download(apiPath+ 'exportTemplate/jcdTemplate', {projectId});
  }else{
    return apiService.download(apiPath+ 'exportTemplate/jcdTemplate');
  }
  
}
export function getGatewayTemplate(){
  return apiService.download(apiPath+ 'exportTemplate/equipmentGatewayTemplate');
}
export function getEquipTemplate(projectId){
  if(projectId){
    return apiService.download(apiPath+ 'exportTemplate/equipmentTemplate', {projectId});
  }else{
    return apiService.download(apiPath+ 'exportTemplate/equipmentTemplate');
  }
  
}
export function getVideoTemplate(projectId){
  if(projectId){
    return apiService.download(apiPath+ 'exportTemplate/videoTemplate', {projectId});
  }else{
    return apiService.download(apiPath+ 'exportTemplate/videoTemplate');
  }
}
export function getBroadTemplate(projectId){
  if(projectId){
    return apiService.download(apiPath+ 'exportTemplate/broadcastTemplate', {projectId});
  }else{
    return apiService.download(apiPath+ 'exportTemplate/broadcastTemplate');
  }
}
//首页
export function getItems(account){
  return apiService.get(apiPath+ 'projectInfo/list/maintenance/'+account);
}

export function classifyDevice(id){
  if(id){
    return apiService.get(apiPath+ 'projectInfo/count/equip/'+ id);
  }else{
    return apiService.get(apiPath+ 'projectInfo/count/equip');
  }
  
}
export function getYhds(obj){
  return apiService.post(apiPath + 'projectInfo/query/list',{...obj});
}
//监测点
export function getJcds(obj){
  return apiService.post(apiPath + 'monitorStation/query/list',{...obj});
}
export function addJcd(obj){
  return apiService.post(apiPath + 'monitorStation/save',obj);
}
export function updateJcd(obj){
  return apiService.post(apiPath + 'monitorStation/update',obj);
}
export function deleteJcd(monitorCode){
  return apiService.get(apiPath + 'monitorStation/delete/'+monitorCode);
}
export function getYhdDetail(id){
  return apiService.get(apiPath + 'monitorStation/query/attachUrl/'+id);
}
export function getRelatedDevices(monitorCode){
  return apiService.get(apiPath+ 'monitorStation/query/related/equip/'+monitorCode);
}
export function getNoRelatedDevices(obj){
  return apiService.post(apiPath+ 'monitorStation/query/not/related/equip', obj);
}
export function getJcdDetail(id){
  return apiService.get(apiPath+ 'monitorStation/get/detail/'+id);
}
export function relateDevice(obj){
  return apiService.post(apiPath+ 'monitorStation/related/equip', obj);
}
export function relateDeviceOff(obj){
  return apiService.post(apiPath+ 'monitorStation/not/related/equip', obj);
}
//网关
export function addGateway(obj){
  return apiService.post(apiPath + 'gateway/save',obj);
}
export function updateGateway(obj){
  return apiService.post(apiPath + 'gateway/update',obj);
}
export function getGateways(obj){
  return apiService.post(apiPath + 'gateway/query/list',{...obj});
}
export function deleteGateway(id){
  return apiService.get(apiPath + 'gateway/delete/'+id);
}
export function getGatewayDetail(id){
  return apiService.get(apiPath+ 'gateway/get/'+id);
}
export function exportGateways(obj){
  return apiService.download(apiPath + 'gateway/export',obj, 'post');
}
export function getOrders(obj){
  return apiService.post(apiPath + 'cmdLog/query/list',obj);
}
export function exportOrders(obj){
  return apiService.download(apiPath + 'cmdLog/export',obj, 'post');
}
export function getGatewayTypes(code){
  return apiService.get(apiPath+ 'gateway/equipType/'+code);
}
export function getGatewayState(obj){
  return apiService.post(apiPath + 'gateway/query/state',obj);
}
//下发命令
export function getTerminalTime(code){ //1
  return apiService.get(apiPath + `cmd/${code}/get/equip/time`);
}
export function setDevicelTime(code){ //2
  return apiService.get(apiPath + `cmd/${code}/set/equip/time`);
}
export function setSensorTime(code, data){ //3
  return apiService.post(apiPath + `cmd/${code}/set/sensor/time`,data);
}
export function getSensorTime(code, sensorId){ //4
  return apiService.get(apiPath + `cmd/${code}/${sensorId}/get/sensor/time`);
}
export function setSensorAttr(code, data){ //5
  return apiService.post(apiPath + `cmd/${code}/set/sensor/attribute`,data);
}
export function getSensorAttr(code, sensorId){ //6
  return apiService.get(apiPath + `cmd/${code}/${sensorId}/get/sensor/attribute`);
}
export function getSensorType(code){ //7
  return apiService.get(apiPath + `cmd/${code}/get/sensor/type`);
}
export function getSensorTest(code){ //8
  return apiService.get(apiPath + `cmd/${code}/sensor/telemeter`);
}
export function setWorkMode(code,mode){ //9
  return apiService.get(apiPath + `cmd/${code}/${mode}/set/work/mode`);
}
export function getWorkMode(code){ //10
  return apiService.get(apiPath + `cmd/${code}/get/work/mode`);
}
export function restart(code){ //11
  return apiService.get(apiPath + `cmd/${code}/reboot`);
}
export function firmwarUpdate(code){ //12
  return apiService.get(apiPath + `cmd/${code}/firmware/upgrade`);
}
export function getParams(code, controlNo){ //13
  return apiService.get(apiPath + `cmd/${code}/${controlNo}/get/platform/parameter`);
}
export function getRTUstate(code){ //14
  return apiService.get(apiPath + `cmd/${code}/get/state`);
}
export function sendBroadcast(code, data){ //16
  return apiService.post(apiPath + `cmd/${code}/send/gb/message`,data);
}
export function sendOrderAgain(id){ 
  return apiService.get(apiPath + `cmd/send/again/`+id);
}
//监测设备
export function addEquip(obj){
  return apiService.post(apiPath + 'equipInfo/save',obj);
}
export function updateEquip(obj){
  return apiService.post(apiPath + 'equipInfo/update',obj);
}
export function getEquips(obj){
  return apiService.post(apiPath + 'equipInfo/query/list',{...obj});
}
export function deleteEquip(id){
  return apiService.get(apiPath + 'equipInfo/delete/'+id);
}
export function getEquipDetail(id){
  return apiService.get(apiPath+ 'equipInfo/get/'+id);
}
export function getEquipData(obj){
  return apiService.post(apiPath + 'equipInfo/report/data',obj);
}

//视频设备
export function addVideo(obj){
  return apiService.post(apiPath + 'video/save',obj);
}
export function updateVideo(obj){
  return apiService.post(apiPath + 'video/update',obj);
}
export function getVideos(obj){
  return apiService.post(apiPath + 'video/query/list',{...obj});
}
export function deleteVideo(id){
  return apiService.get(apiPath + 'video/delete/'+id);
}
export function getVideoDetail(id){
  return apiService.get(apiPath+ 'video/get/'+id);
}

//广播设备
export function addRadio(obj){
  return apiService.post(apiPath + 'broad/save',obj);
}
export function updateRadio(obj){
  return apiService.post(apiPath + 'broad/update',obj);
}
export function getRadios(obj){
  return apiService.post(apiPath + 'broad/query/list',{...obj});
}
export function deleteRadio(id){
  return apiService.get(apiPath + 'broad/delete/'+id);
}
export function getRadioDetail(id){
  return apiService.get(apiPath+ 'broad/get/'+id);
}
export function getRadioTime(id){
  return apiService.get(apiPath + 'broad/onLine/count/'+id);
}
export function getRadioTimeList(obj){
  return apiService.post(apiPath + 'broad/onLine/list',obj);
}
//固件
export function addFirmware(obj){
  return apiService.post(apiPath + 'firware/save',obj);
}
export function updateFirmware(obj){
  return apiService.post(apiPath + 'firware/update',obj);
}
export function getFirmwares(obj){
  return apiService.post(apiPath + 'firware/query/list',obj);
}
export function getToDevices(obj){
  return apiService.post(apiPath + 'firware/equip/query/list',obj);
}
export function deleteFirmware(id){
  return apiService.get(apiPath + 'firware/delete/'+id);
}
export function getFirmwareDetail(id){
  return apiService.get(apiPath+ 'firware/get/'+id);
}
export function deleteFirmwareFile(id){
  return apiService.get(apiPath + 'firware/attach/delete/'+id);
}
export function downFirmwareFile(url){
  return apiService.download(apiPath + 'firware/down/'+url);
}
export function upgradeFirmware(obj){
  return apiService.post(apiPath + 'firware/upgrade',obj);
}
export function getFirmwareUpgradeLogs(obj){
  return apiService.post(apiPath + 'firware/record/query/list',obj);
}
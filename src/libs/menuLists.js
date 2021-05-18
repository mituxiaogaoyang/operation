/*
 * @Author: renfeng 
 * @Date: 2020-07-14 11:06:05 
 * @Last Modified by: renfeng
 * @Last Modified time: 2020-08-12 15:44:45
 */
// 左侧导航菜单
const menuLists = [
    {
        label: '项目概况',
        name: 'index',
        icon: 'dashboard'
    },{
        label: '监测点管理',
        name: 'monitorPoints',
        icon: 'monitorPoint'
    },{
        label: '设备管理',
        name: 'devices',
        icon: 'device',
        children: [
            {
                label: '网关设备管理',
                name: 'gatewayDevices',
            },{
                label: '监测设备管理',
                name: 'monitorDevices',
            },{
                label: '视频设备管理',
                name: 'videoDevices',
            },{
                label: '广播设备管理',
                name: 'broadcastDevices',
            },
        ]
    },{
        label: '设备固件管理',
        name: 'firmware',
        icon: 'firmware',
    },
];
// 用于路由文件路径和名字设置
let  arrRoutes = [];
menuLists.forEach(item =>{
    const listsLevel2 = item.children;
    if(listsLevel2){
        listsLevel2.forEach(item2 =>{
            arrRoutes.push({
                title: item2.label,
                name: item2.name,
                path: item.name +'/' + item2.name
            });
        });
    }else{
        arrRoutes.push({
            title: item.label,
            name:item.name,
            path:item.name
        });
    }
    
});
export {menuLists, arrRoutes};
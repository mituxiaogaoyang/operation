'use strict'
//全局配置设置的地方，存在static文件夹中，不用被打包，方便打包后修改全局参数
const _config = {};
(() => {
    const _oblique_photography = {
        // offsetH指该倾斜摄影数据高程上调150m
        '510000_513400_513431': 'http://mapdata.cmfun.cn:34567/3dtile/tileset.json?offsetH=150'
    };
    Object.freeze(_oblique_photography);
    const _insar = {
        '510000_513400_513431': 'http://mapdata.cmfun.cn:34567/insar/xyc_insar.kml'
    };
    Object.freeze(_insar);
    const _terrain = {
        '510000_513400_513431': 'http://mapdata.cmfun.cn:34567/terrain/'
    };
    Object.freeze(_terrain);
    _config.tileset = _oblique_photography;
    _config.insar = _insar;
    _config.terrain = _terrain;
    Object.freeze(_config);
})();

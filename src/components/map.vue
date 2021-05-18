<template>
  <div class="map_container" id="cesiumContainer"></div>
</template>

<script>
//import Cesium from 'cesium/Cesium';
const Cesium = require("cesium/Cesium");
import "cesium/Widgets/widgets.css";
import * as cesiumConfig from "@/libs/cesiumConfig.js";
export default {
  components: {},
  data() {
    return {};
  },
  props: ["positionMap", "areaArr"],
  watch: {
    positionMap: {
      handler(nV) {
        this.setView(nV.long, nV.lat);
        this.loadTerrainAndImagery();
      },
      deep: true,
    },
  },
  mounted() {
    const otherConfig = {
      //terrainProvider: Cesium.createWorldTerrain(),
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url:
          "http://mt{s}.google.cn/vt/lyrs=y&hl=en-US&gl=US&x={x}&y={y}&z={z}&s=G",
        // url: 'http://www.google.cn/maps/vt?lyrs=y@740&gl=cn&x={x}&y={y}&z={z}',
        subdomains: ["0", "1", "2", "3"],
        credit: new Cesium.Credit("卫星地图"),
      }),
    };
    const viewer = new Cesium.Viewer(
      "cesiumContainer",
      Object.assign(cesiumConfig.mapConfig, otherConfig)
    );
    this.viewer = viewer;
    this.setView(this.positionMap.long, this.positionMap.lat);
    this.loadTerrainAndImagery();
    //监听点击事件
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction((event) => {
      const ray = viewer.camera.getPickRay(event.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      const coords = Cesium.Cartographic.fromCartesian(cartesian);
      const long = Cesium.Math.toDegrees(coords.longitude);
      const lat = Cesium.Math.toDegrees(coords.latitude);
      let height = 0;
      height = viewer.scene.globe.getHeight(coords); //球体时的高度
      //height = coords.height; //模型时高度

      if (long) {
        this.$emit("setCoords", { long, lat, height });
      } else {
        this.$message.warning("操作异常，请重试");
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  methods: {
    getCameraInfo() {
      console.log(
        "heading :" +
          this.viewer.camera.heading +
          ";pitch :" +
          this.viewer.camera.pitch +
          ";roll :" +
          this.viewer.camera.roll
      );
    },
    setView(long, lat) {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(long, lat, 7000.0),
        orientation: {
          heading: 6.258,
          pitch: -0.96,
          roll: 6.28,
        },
      });
    },
    loadTerrainAndImagery() {
      const [provinceId, cityId, areaId] = this.areaArr;
      const { tileset, insar, terrain } = _config;
      if (provinceId && cityId && areaId) {
        const areaStr = provinceId + "_" + cityId + "_" + areaId;
        for (let k in tileset) {
          if (k === areaStr) {
            //_config配置表里有该地区的地形，倾斜摄影数据
            const tilesetCurr = this.viewer.scene.primitives.add(
              new Cesium.Cesium3DTileset({
                url: tileset[k],
              })
            );
          }
        }
        for (let k in terrain) {
          if (k === areaStr) {
            //_config配置表里有该地区的地形，倾斜摄影数据
            const terrainCurr = new Cesium.CesiumTerrainProvider({
              url: terrain[k],
            });
            this.viewer.terrainProvider = terrainCurr;
          }
        }
      }
    },
  },
};
</script>

<style lang='less'>
.map_container {
  margin: -0.3rem -1rem;
  height: 27rem;
  button {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.3rem 1rem;
  }
}
.cesium-viewer-bottom {
  display: none;
}
</style>
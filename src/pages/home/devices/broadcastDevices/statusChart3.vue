<template>
  <div class="status_highcharts">
    <div class="highcharts-container" id="container"></div>
  </div>
</template>

<script>
import Highcharts from "highcharts";
import xRange from "highcharts/modules/xrange";
xRange(Highcharts);
Highcharts.setOptions({
  global: {
    useUTC: false,
  },
});
export default {
  components: {},
  data() {
    return {};
  },
  props: ["timeArr", "statusArr", "timeEnd"],
  mounted() {
    this.initChart();
  },
  watch: {
    timeArr(nV) {
      if (nV.length === 0) {
        this.updateChart([]);
        return;
      }
      const arrTime = [...nV, this.timeEnd];
      let data = [];
      for (let i = 0; i < arrTime.length - 1; i++) {
        data.push({
          x: arrTime[i],
          x2: arrTime[i + 1],
          y: this.statusArr[i],
        });
      }
      this.updateChart(data);
    },
  },
  methods: {
    initChart() {
      const options = {
        chart: {
          type: "xrange",
        },
        title: {
          text: "",
        },
        xAxis: {
          type: "datetime",

          dateTimeLabelFormats: {
            day: "%Y/%m/%d",
            week: "%Y/%m/%d",
            second: "%Y/%m/%d %H:%M:%S",
          },
        },
        plotOptions: {
          series: {
            turboThreshold: 0,
          },
        },
        yAxis: {
          title: {
            text: "",
          },
          gridLineDashStyle: "Dash",
          categories: ["离线", "在线"],
          reversed: false,
        },
        tooltip: {
          dateTimeLabelFormats: {
            second: "%Y/%m/%d %H:%M:%S",
            day: "%Y/%m/%d %H:%M:%S",
          },
        },
        credits: {
          enabled: false, //去水印
        },
        series: [
          {
            name: "设备在线状态",
            borderColor: "white",
            pointWidth: 2,
            colors: ["red", "green"],
            data: [],
            dataLabels: {
              enabled: true,
            },
          },
        ],
      };
      this.chart = new Highcharts.Chart("container", options);
    },
    updateChart(data) {
      this.chart.series[0].setData(data);
    },
  },
};
</script>

<style lang='less' scoped>
.status_highcharts {
  .highcharts-container {
    width: 100%;
    height: 18rem;
  }
}
</style>
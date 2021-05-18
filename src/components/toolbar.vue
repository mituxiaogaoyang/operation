<template>
  <div class="tool_bar">
    <div class="ceil_left" :class="{'ceil_fix':isSearchFloat}">
      <template v-if="includeArea">
        <!-- <div class="list_select">
          <div class="label">省级：</div>
          <el-select v-model="province" placeholder="请选择" clearable>
            <el-option
              v-for="item in provinces"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div> -->
        <div class="list_select">
          <div class="label">市州：</div>
          <el-select v-model="city" placeholder="请选择" clearable>
            <el-option
              v-for="item in cities"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
        <div class="list_select">
          <div class="label">区县：</div>
          <el-select v-model="county" placeholder="请选择" clearable>
            <el-option
              v-for="item in counties"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
      </template>
      <div class="list_select">
        <slot name="searchBefore"></slot>
      </div>

      <div class="list_search">
        <el-input :placeholder="'请输入'+placeholder" v-model="searchText" class="input-with-select">
          <el-button slot="append" icon="el-icon-search" @click="searchKey"></el-button>
        </el-input>
      </div>
    </div>
    <div class="ceil_right">
      <slot name="btnBox"></slot>
    </div>
  </div>
</template>

<script>
import {getProvinces, getCities} from '@/apis/api';
export default {
  components: {},
  props:{
    placeholder: {
      type: String,
      default: '关键字'
    },
    includeArea:{
      type: Boolean,
      default: true
    },
    isSearchFloat:{
      type: Boolean,
      default: false
    },
  }, 
  data() {
    return {
      province: "",
      provinces: [],
      city: "",
      cities: [],
      county: "",
      counties: [],
      searchText: ""
    };
  },
  computed:{
    provinceId(){
      return sessionStorage.getItem('provinceId');
    }
  },
  mounted() {
    if(this.includeArea){
      //this.getProvinces();
      this.getCities(this.provinceId,1);
    }
  },
  watch: {
    province(nV){
      nV && this.getCities(nV,1);
      this.city= '';
      this.county = '';
      this.cities = [];
      this.counties = [];
      this.$emit('changeArea',{provinceId:this.provinceId,cityId: this.city, areaId: this.county});
    },
    city(nV){
      this.county = '';
      this.counties = [];
      let provinceId ='';
      if(this.city){
        this.getCities(nV, 2);
        provinceId = this.provinceId;
      }
      //this.city && this.getCities(nV, 2);
      this.$emit('changeArea',{provinceId , cityId: nV, areaId: this.county});
    },
    county(nV){
      this.city && this.$emit('changeArea',{provinceId:this.provinceId, cityId: this.city, areaId: nV});
    }
  },
  methods: {
    getProvinces(){
      getProvinces().then(res =>{
        this.provinces = res;
      });
    },
    getCities(id, level){ //level: 1-市 2-区县
      getCities(id).then(res =>{
        level ===1 && (this.cities = res);
        level ===2 && (this.counties = res);
      });
    },
    searchKey(){
      this.$emit('seachByWord',this.searchText);
    }
  }
};
</script>

<style lang='less'>
.tool_bar {
  padding: 0.3rem 0 0.8rem;
  height:1.8rem;
  .ceil_left {
    float: left;
    .list_select {
      font-size: 0.75rem;
      display: inline-block;
      margin-right: 1rem;
      .label {
        display: inline-block;
        font-weight: bold;
        color: #212121;
      }
      .el-select {
        width: 7.8rem;
      }
      .list_slot {
        display: inline-block;
        margin-right: 1rem;
      }
    }
    .list_search {
      display: inline-block;
      padding-left: 1rem;
      width: 12rem;
      .el-input__inner {
        border-radius: 2rem 0 0 2rem;
        
        background: #F7F9FF;
        border-color: #E5E5E5;
      }
      .el-input-group__append {
        border-radius: 0 2rem 2rem 0;
        padding: 0 0.8rem;
        background: #4977FC;
        border:0;
        button.el-button{
          color:#fff;
        }
      }
    }
    &.ceil_fix{
      float:none;
      .list_search {
        float:right;
      }
    }
  }
  .ceil_right {
    float: right;
  }
  &::after {
    // content: "";
    // display: block;
    // height: 0;
    // clear: both;
    // visibility: hidden;
  }
}
</style>
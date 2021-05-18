<template>
  <div id="app">
    <login-operation></login-operation>
  </div>
</template>

<script>
import loginOperation from './login';
export default{
  components: {
    loginOperation
  },
  data() {
    return{
      
    };
  },
  methods: {
    
  }
};
</script>
<style>
body,html{
  margin:0;
  height: 100%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #9B9B9D;
  height: 100%;
  overflow: hidden;
}
</style>
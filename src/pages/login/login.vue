<template>
  <div class='login_page'>
    <div class="login_container">
      <img src="../../assets/imgs/login/pic.png" alt="">
      <div class="login_box">
        <div class="login_core">
          <div class="login_title">用户登录</div>
          <el-input
            placeholder="请输入账号"
            prefix-icon="el-icon-user-solid"
            v-model="account">
          </el-input>
          <el-input
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-unlock"
            v-model="password">
          </el-input>
          <div class="input_line">
            <el-input
              placeholder="验证码"
              prefix-icon="el-icon-s-open"
              v-model="account">
            </el-input>
            <div class="image_info">
              <div class="img"><img src="" alt=""></div>
              <el-button type="text">换一张</el-button>
            </div>
          </div>
          <el-button type="primary" @click="login">登录</el-button>
        </div>
        
      </div> 
    </div>
  </div>
</template>

<script>
  import {loginIn} from '@/apis/login';
  import {Base64} from 'js-base64';
  export default {
    components: {
      
    },
    data () {
      return {
        account: '',
        password: '',
        checkCode: '',
      };
    },
    mounted () {

    },
    methods: {
      login() {
        
        const {account, password} = this;
        
        if(account.length && password.length){
          loginIn(account, Base64.encode(password));
        }else{
          this.$message.warning('账号或密码不能为空');
        }     
      }
    },
  };
</script>

<style lang='less'>
@import '@/assets/less/cover.less'; 
@colorBlue: #2882FE;
.login_page{
  height: 100%;
  background: url(../../assets/imgs/login/bg.png);
  background-size: 100% 100%;
  overflow: hidden;
  .login_container{
    height:66%;
    margin-top:40rem;
    width:70%;
    margin:0 auto;
    margin-top:16vh;
    background-color: #fff;
    position: relative;
    overflow: hidden;
    >img{
      height: 100%;
      width:auto;
      display: block;
      overflow: hidden;
    }
    .login_box{
      position: absolute;
      z-index: 2;
      top:0;
      right:0;
      bottom: 0;
      background-color: #fff;
      width:30rem;
      .login_core{
        width:16rem;
        margin:4rem auto;
        .login_title{
          text-align: center;
          color:@colorBlue;
          font-size: 1.2rem;
          font-weight: 500;
          margin:1.6rem 0;
          letter-spacing: 0.1rem;
        }
        .el-input--prefix .el-input__inner{
          padding-left: 1.5rem;
        }
        .el-input{
          margin:0.9rem 0;
        }
        .input_line{  
          display: none;
          .el-input{
            float:left;
            width:50%;
          }
          .image_info{
            float:right;
            margin:0.6rem 0;
            width:7.2rem;
            line-height: 1.8rem;
            .img{
              float:left;
            }
            .el-button{
              float:right;
              padding:0;
              line-height: 1.8rem;
            }

          }
          &::after{
            content: '';
            display: block;
            clear: both;
          }
        }
        >.el-button{
          display: block;
          margin-top:1.2rem;
          width: 100%;
          letter-spacing: 0.2rem;
        }
      }
    }
  }
}
</style>
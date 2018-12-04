<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip">请输入用户名和密码</p>
        </div>
      </Card>
      <Spin size="large" fix v-if="spinShow"></Spin>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  data(){
    return {
      spinShow:false
    }
  },
  components: {
    LoginForm
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ userName, password }) {
      this.spinShow=true;
      this.handleLogin({ userName, password }).then(res => {
        if(res.data.code==200){
          this.getUserInfo().then(res => {
            this.$router.push({
              name: this.$config.homeName
            })
            //this.spinShow=false;
          }).catch(error=>{
            this.$Notice.error({ title: "错误提示", desc: "获取用户信息错误！" });
            this.spinShow=false;
            console.log(error);
          });
        }else{
          this.spinShow=false;
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
        }
      }).catch(error=>{
        this.spinShow=false;
        this.$Notice.error({ title: "错误提示", desc: "登录失败！" });
        console.log(error);
      });

    }
  }
}
</script>

<style>

</style>

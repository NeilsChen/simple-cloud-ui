<template>
  <div>
    <Upload multiple type="drag" name="file" action="http://localhost:8088/admin-server/uploadAvator" :headers="headers">
      <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
        <p>点击或拖放文件到此处上传</p>
      </div>
    </Upload>   
    <Avatar size="large" :src="userAvatorUrl" />
  </div>
</template>
<script>
import config from '@/config'
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
export default {
  name: "userinfo-table",
 
  data() {
    return {

      // userAvatorUrl: baseUrl + "/admin-server/file/avator/end.png",
      userAvatorUrl:require('@/assets/images/default-avator.jpg'),
      headers:{
        Authorization:''
      }
    }
  },
  mounted() {
    this.headers.Authorization = "Bearer "+this.$store.state.user.token;
  }
}

</script>

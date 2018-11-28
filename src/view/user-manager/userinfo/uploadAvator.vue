<template>
  <div>
    <Upload multiple type="drag" show-upload-list="true" name="file" action="http://localhost:8088/admin-server/uploadAvator">
      <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
        <p>点击或拖放文件到此处上传</p>
      </div>
    </Upload>
<!--     <img src="http://localhost:8011/api/file/1.jpg">
    <img src="http://localhost:8088/admin-server/api/file/客厅4.jpg"> -->
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
    	userAvatorUrl:baseUrl+"/admin-server/file/avator/end.png"
    }
  }
}

</script>

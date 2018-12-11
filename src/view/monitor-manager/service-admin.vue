<template>
    <iframe :src='srcUrl' id='show' width='100%' height="780px" frameborder=0 name='showHere' ></iframe>
</template>
<script>
import config from '@/config'
const baseIP= process.env.NODE_ENV === 'development' ? config.baseUrl.devIP : config.baseUrl.proIP;

export default {
  name: 'service-admin',
  data() {
  	return{
  		srcUrl:baseIP+":18080"
  	}
  }
}
</script>
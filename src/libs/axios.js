import axios from 'axios'
import store from '@/store'
import router from '../router'
import {Notice} from 'iview'
// import { Spin } from 'iview'
const addErrorLog = errorInfo => {
  console.log(errorInfo);
  
  if(errorInfo){
    const { statusText, status, request: { responseURL } } = errorInfo
    info = {
      type: 'ajax',
      code: status,
      mes: statusText,
      url: responseURL
    }
    if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
  }else{

     Notice.error({title:"无法连接服务器！"});
  }
}

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig (url) {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        "Content-Type":"application/x-www-form-urlencoded"
      }
    }
    //请求头添加 Authorization  Token
    if (url !== 'login') {
      config.headers['Authorization'] = 'Bearer ' + store.state.user.token
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      //请求返回代码=520时表示token验证失败，跳转到登录页面
      if(res!=null && res.data!=null){
        if(res.data.code==520){
          store.commit('setToken','');
          store.commit('setAccess','');
          router.push("/login")
        }
      }
     
      const { data, status } = res
      return { data, status }
    }, error => {
      this.destroy(url)
      addErrorLog(error.response)
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(options.url), options)  // 添加 options.url
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest

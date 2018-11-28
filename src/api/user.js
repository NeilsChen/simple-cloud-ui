import axios from '@/libs/api.request'

export const login = ({ userName, password }) => {
  // const data = {
  //   username:userName,
  //   password:password
  // }
  let params = new URLSearchParams();
  params.append('username', userName);
  params.append('password', password);
  return axios.request({
    url: '/admin-server/login',
    data:params,
    method: 'post'
  })
}

export const getUserInfo = () => {

  return axios.request({
    url: '/admin-server/getUserInfo',
    // params: {
    //   username:userName
    // },
    method: 'get'
  })
}

export const logout = () => {
  return axios.request({
    url: '/admin-server/logout',
    method: 'post'
  })
}

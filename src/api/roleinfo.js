import axios from '@/libs/api.request'

export const saveErrorLogger = data => {
  return axios.request({
    url: '/admin-server/user/findUsersWithPaging',
    data: data,
    method: 'post'
  })
}


export const findAllRoles = ({ data, token }) => {
  return axios.request({
    url: '/admin-server/role/findAllRoles',
    params: {
      data:data,
      token:token
    },
    method: 'get'
  })
}
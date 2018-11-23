import axios from '@/libs/api.request'

export const axFindPermissionTreeData = ({ data, token }) => {
  return axios.request({
    url: '/admin-server/permission/findPermissionTreeData',
    params: {
      data:data,
      token:token
    },
    method: 'get'
  })
}


export const axAddOrUpdatePermission = ( data ) => {
  return axios.request({
    url: '/admin-server/permission/addOrUpdatePermission',
    data:data,
    method: 'post'
  })
}

export const axDeletePermission = ( data ) => {
  return axios.request({
    url: '/admin-server/permission/deletePermission',
    data:data,
    method: 'post'
  })
}
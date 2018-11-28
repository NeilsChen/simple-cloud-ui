import axios from '@/libs/api.request'

export const saveErrorLogger = data => {
  return axios.request({
    url: '/admin-server/user/findUsersWithPaging',
    data: data,
    method: 'post'
  })
}


export const axFindAllRoles = ( userId ) => {
  return axios.request({
    url: '/admin-server/role/findAllRoles',
    params: {
      userId:userId
    },
    method: 'get'
  })
}

export const axFindRolesWithPaging = (data) => {
  return axios.request({
    url: '/admin-server/role/findRolesWithPaging',
    params: {
      data:data
    },
    method: 'get'
  })
}

export const axDeleteRole = data => {
  return axios.request({
    url: '/admin-server/role/deleteRole',
    data: data,
    method: 'post'
  })
}

export const axAddRole = data => {
  return axios.request({
    url: '/admin-server/role/addRole',
    data: data,
    method: 'post'
  })
}

export const axUpdateRole = data => {
  return axios.request({
    url: '/admin-server/role/updateRole',
    data: data,
    method: 'post'
  })
}

axHasRelateUser
export const axHasRelateUser = ({ data, token }) => {
  return axios.request({
    url: '/admin-server/role/hasRelateUser',
    params: {
      data:data,
      token:token
    },
    method: 'get'
  })
}


export const axUpdateRolePermission = data => {
  return axios.request({
    url: '/admin-server/role/updateRolePermission',
    data: data,
    method: 'post'
  })
}
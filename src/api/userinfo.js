import axios from '@/libs/api.request'

export const saveErrorLogger = data => {
  return axios.request({
    url: '/admin-server/user/findUsersWithPaging',
    data: data,
    method: 'post'
  })
}


export const axFindUsersWithPaging = ( data) => {
  return axios.request({
    url: '/admin-server/user/findUsersWithPaging',
    params: {
      data: data
    },
    method: 'get'
  })
}


export const axFindUserById = ( userId ) => {
  return axios.request({
    url: '/admin-server/user/findUserById',
    params: {
      id: userId
    },
    method: 'get'
  })
}


export const axDeleteUser = ( data ) => {
  return axios.request({
    url: '/admin-server/user/deleteUser',
    data: data,
    method: 'post'
  })
}

export const axAddUser = ( data ) => {
  return axios.request({
    url: '/admin-server/user/addUser',
    data: data,
    method: 'post'
  })
}

export const axUpdateUser = ( data ) => {
  return axios.request({
    url: '/admin-server/user/updateUser',
    data: data,
    method: 'post'
  })
}

export const axUpdatePassword = ( data ) => {
  return axios.request({
    url: '/admin-server/user/updatePassword',
    data: data,
    method: 'post'
  })
}

export const axUpdateUserRole = ( data ) => {
  return axios.request({
    url: '/admin-server/user/updateUserRole',
    data: data,
    method: 'post'
  })
}

export const axResetPassword = ( data ) => {
  return axios.request({
    url: '/admin-server/user/resetPassword',
    data: data,
    method: 'post'
  })
}

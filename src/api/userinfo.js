import axios from '@/libs/api.request'

export const saveErrorLogger = data => {
  return axios.request({
    url: '/admin-server/user/findUsersWithPaging',
    data: data,
    method: 'post'
  })
}


export const axFindUsersWithPaging = ({ data, token }) => {
  return axios.request({
    url: '/admin-server/user/findUsersWithPaging',
    params: {
      data: data,
      token: token
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
	console.log(data);
  return axios.request({
    url: '/admin-server/user/addUser',
    data: data,
    method: 'post'
  })
}

export const axUpdateUser = ( data ) => {
  console.log(data);
  return axios.request({
    url: '/admin-server/user/updateUser',
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
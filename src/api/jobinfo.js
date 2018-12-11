import axios from '@/libs/api.request'

export const axFindJobsWithPaging = ( data) => {
  return axios.request({
    url: '/admin-server/job/list',
    params: {
      data: data
    },
    method: 'get'
  })
}

export const axFindJobLogDetais = ( {jobName,currentPage,pageSize}) => {
  return axios.request({
    url: '/admin-server/job/findJobLogDetail',
    params: {
      jobName: jobName,
      currentPage:currentPage,
      pageSize:pageSize
    },
    method: 'get'
  })
}
export const axAddJob = ( data ) => {
  return axios.request({
    url: '/admin-server/job/add',
    data,
    method: 'post'
  })
}

export const axUpdateJob = ( data ) => {
  return axios.request({
    url: '/admin-server/job/update',
    data,
    method: 'post'
  })
}


export const axTriggerJob = ( data ) => {
  return axios.request({
    url: '/admin-server/job/trigger',
    data: data,
    method: 'post'
  })
}

export const axPauseJob = ( data ) => {
  return axios.request({
    url: '/admin-server/job/pause',
    data: data,
    method: 'post'
  })
}


export const axStartJob = ( data ) => {
  return axios.request({
    url: '/admin-server/job/resume',
    data: data,
    method: 'post'
  })
}

export const axRemoveJob = ( data ) => {
  return axios.request({
    url: '/admin-server/job/remove',
    data: data,
    method: 'post'
  })
}
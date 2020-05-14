const jwtDecode = require('jwt-decode')

export const checkAuth = () => {
  let accessToken = localStorage.getItem('access_token')
  if (!accessToken) return false
  let payload = jwtDecode(accessToken)
  console.log(payload)
  return payload.exp*1000 - Date.now() > 0
}

export const checkRefresh = () => {
  let refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false
  let payload = jwtDecode(refreshToken)
  console.log(payload)
  return payload.exp*1000 - Date.now() > 0
}

export const setTokenPair = (pair) => {
  localStorage.setItem('access_token', pair.access)  
  localStorage.setItem('refresh_token', pair.refresh)  
  console.log('Saved access and refresh tokens to local storage', pair.access, pair.refresh)
}

export const deleteTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export const refreshToken = () => {
  const REFRESH_URL = '/api/auth/refresh_token/'
  let data = { refresh: localStorage.getItem('refresh_token') }
  if (!data) throw({data: 'No refresh token', status: 400, logout: true})
  return fetch(REFRESH_URL,
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  .then(res => {
    return res.json().then(json => {
      return new Promise((resolve, reject) => {
        if (res.ok) {
          setTokenPair(json)
          resolve({data: json, status: res.status})
        } else if (res.status === 400 || res.status === 401) 
          reject({status: res.status, data: 'Could not refresh token', logout: true})
        else 
          reject({status: res.status, data: 'Could not refresh token'})
      })
    })
  })
}

export const retryRequest = (req, url, method='POST') => {
  let isPOST = method === 'POST'
  
  let FETCH_OPTIONS = (token) => ({
    method,    
    headers: {
      'Authorization': 'Bearer ' + token
    }    
  })
  let POST_FETCH_OPTIONS = (token) => ({
    method,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req)
  })
  

  console.log(`401 Unauthorized: ${url}`)
  return refreshToken()
  .then(res => {
    console.log(`Retrying ${url}. Refresh tokens: `, res, res.status)
    return new Promise(resolve => {
      resolve(res.status)      
    })
  })
  .then(status => {// if refreshed successfully try to request again
    let token = localStorage.getItem('access_token')
    console.log('Sending 2nd req')
    return fetch(url, isPOST ? POST_FETCH_OPTIONS(token) : FETCH_OPTIONS(token))       
  })
  .then(res => { // 2nd attempt result
    return res.json().then(json => {
      return new Promise((resolve, reject) => {
        if (res.ok) resolve({data: json, status: res.status})
        else reject({status: res.status, data: '2nd attempt failed', logout: true})
      })
    })
  })
  
  
}
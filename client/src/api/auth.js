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

export const refreshToken = () => {
  const REFRESH_URL = '/api/auth/refresh_token/'
  let data = { refresh: localStorage.getItem('refresh_token') }
  if (!data) return new Promise((resolve, reject) => { 
    reject({tokens: null, status: 401}) 
  })
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
      if (res.ok) setTokenPair(json)
      return {tokens: json, status: res.status}
    })
  })
}
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

export const retryRequest = (req, url) => {
  console.log(`401 Unauthorized: ${url}`)
  return refreshToken()
  .then(res => {
    console.log(`Retrying ${url}. Refresh tokens: `, res, res.status)
    return new Promise((resolve, reject) => {
      if (res.status === 200) resolve(res.status)
      else reject({status: res.status, data: 'Could not refresh tokens', logout: true})
    })
  })
  .then(status => {// if refreshed successfully try to request again
    console.log('Sending 2nd req')
    return fetch(url,
      {
        method: 'POST',
        body: JSON.stringify(req),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
      }
    )       
  })
  .then(res => {
    return res.json().then(json => {
      return new Promise((resolve, reject) => {
        if (res.status === 200) resolve({data: json, status: res.status})
        else reject({status: res.status, data: '2nd attempt failed'})
      })
    })
  }) 
  
}
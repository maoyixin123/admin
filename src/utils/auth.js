import Cookies from 'js-cookie'

const TokenKey = 'hrsaas-ihrm-token'
const timeKey = 'hrsaas-ihrm-time'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getTimeStamp() { // 获取时间戳
  return Cookies.get(timeKey)
}
export function setTimeStamp() {
  return Cookies.set(timeKey, Date.now()) // 设置时间戳 把当前时间设置给上面的获取时间戳
}

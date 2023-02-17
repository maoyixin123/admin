import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getTimeStamp } from '@/utils/auth'
import router from '@/router'

const timeOut = 20000
const service = axios.create(
  { baseURL: process.env.VUE_APP_BASE_API, // 设置axios请求的基础的基础地址
    timeout: 5000// 定义5秒超时
  }
)
service.interceptors.request.use(
  // 请求拦截器
  config => { // 获取成功时
    if (store.getters.token) { // 如果里面有token
      if (IsCheckTimeOut()) { // 如果大于超时时间
        store.dispatch('user/logout') // 获取actions的登出函数 这一步会删除用户信息
        router.push('/login') // 跳转到登录页面
        return Promise.reject(new Error('请求超时了,请重新登录')) // 返回一个promise的错误提示信息
      }
      config.headers['Authorization'] = `Bearer ${store.getters.token}` // 把token注入到token里
    }
    return config // 必须返回的配置
  }, error => {
    return Promise.reject(error) // 如果没有的话就提示错误信息
  }
)
service.interceptors.response.use(response => {
  // axios默认加了一层data
  const { success, message, data } = response.data
  //   要根据success的成功与否决定下面的操作
  if (success) {
    return data
  } else {
    // 业务已经错误了 还能进then ? 不能 ！ 应该进catch
    Message.error(message) // 提示错误消息
    return Promise.reject(new Error(message))
  }
}, error => {
  // error 信息 里面 response的对象
  if (error.response && error.response.data && error.response.data.code === 10002) {
    // 当等于10002的时候 表示 后端告诉我token超时了
    store.dispatch('user/logout') // 登出action 删除token
    router.push('/login')
  } else {
    Message.error(error.message) // 提示错误信息
  }
  return Promise.reject(error)
})
function IsCheckTimeOut() { // 检测时间戳
  var currentTime = Date.now() // 获取当前时间的时间戳
  var timeStamp = getTimeStamp() // 缓存当前的时间戳
  return (currentTime - timeStamp) / 1000 > timeOut // 用现在的时间戳减去缓存的时间戳假如大于设置好的登录超时时间就会执行请求拦截器的
}
export default service

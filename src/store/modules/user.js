// 状态
import { getToken, removeToken, setTimeStamp, setToken } from '@/utils/auth'
import getUserInfo, { getUserDetailById, login } from '@/api/user'

const state = {
  token: getToken(),
  userInfo: {} // 设置一个空的公共对象
}
// 修改状态
const mutations = {
  // 设置token
  setToken(state, token) {
    state.token = token // 设置token  只是修改state的数据  123 =》 1234
    // vuex变化 => 缓存数据
    setToken(token) // vuex和 缓存数据的同步
  },
  // 删除缓存
  removeToken(state) {
    state.token = null // 删除vuex的token
    removeToken() // 先清除 vuex  再清除缓存 vuex和 缓存数据的同步
  },
  setUserInfo(state, userInfo) { // 接收actions里提交来的用户资料
    state.userInfo = { ...userInfo } // 把传来的用户资料传给state的对象  ...userInfo浅拷贝的意思是数据更新后，才会触发组件的跟新
  },
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
// 执行异步
const actions = {
  // 定义login action  也需要参数 调用action时 传递过来的参数
  async login(context, data) { // 登录
    // eslint-disable-next-line no-undef
    const result = await login(data) // 实际上就是一个promis ult就是执行的结果
    // axios默认给数据加了一层data
    // 表示登录接口调用成功 也就是意味着你的用户名和密码是正确的
    // 现在有用户token
    // actions 修改state 必须通过mutations
    context.commit('setToken', result)
    setTimeStamp() // 在登录的时候把登录时的时间戳传递给缓存中进行缓存
  },
  async getUserInfo(context) { // 获取用户资料
    const result = await getUserInfo() // 等待这个函数体执行完毕获取返回值 请求到的是用户的的资料
    const baseInfo = await getUserDetailById(result.userId)
    context.commit('setUserInfo', { ...result, ...baseInfo }) // 把获取到的用户资料传递给mutations里面
    return result
  },
  logout(context) {
    context.commit('removeToken') // 登出时删除用户资料
    context.commit(' removeUserInfo') // 登出时删除用户头像
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}

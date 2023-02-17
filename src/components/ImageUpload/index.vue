<template>
  <!-- 上传组件 -->
  <div>
    <!-- :class="{ class名称：布尔值 }" -->
    <!-- el-upload之所以能够显示图片 是因为 fileList中有值 -->
    <el-upload
      list-type="picture-card"
      :file-list="fileList"
      :on-preview="preview"
      :on-remove="handleRemove"
      :on-change="changeFile"
      :before-upload="beforeUpload"
      :http-request="upload"
      action="#"
      :class="{disabled: fileComputed}"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <el-progress v-if="showPercent" :percentage="percent" style="width: 180px" />

    <!-- 预览图片 -->
    <el-dialog :visible.sync="showDialog" title="图片预览">
      <img :src="imgUrl" alt="" style="width:100%">
    </el-dialog>
  </div>

</template>

<script>
import COS from 'cos-js-sdk-v5'

const cos = new COS({
  SecretId: 'AKID0mqfEWqlUzIbeSkGRL6c7ML6c0B93To9', // 身份识别 ID
  SecretKey: 'JFwNZdeRF2iOp03FFsGNDm44vWFitmNF' // 身份密钥
})
export default {
  props: {
    limit: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      showPercent: false, // 控制进度条的显示和隐藏
      percent: 0, // 当前的进度
      showDialog: false, // 默认隐藏
      imgUrl: '',
      fileList: []
    }
  },
  computed: {
    // 只要该计算属性为true 就表示 我们需要隐藏上传按钮
    fileComputed() {
      return this.fileList.length === this.limit
    }
  },
  methods: {
    preview(file) {
      this.imgUrl = file.url
      this.showDialog = true
    },
    // file就是要删除的file
    handleRemove(file) {
      // 根据file中uid将当前的fileList中的数据进行移除
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
      // filter方法会得到一个新的数组
    },
    // 不能够一味 的进行push 因为该函数会被多次调用 fileList其实就是当前最新的文件列表
    changeFile(file, fileList) {
      // this.fileList = [...fileList]
      this.fileList = fileList.map(item => item)
    },
    // 上传之前检查
    beforeUpload(file) {
      //   console.log(file)
      // 要开始做文件上传的检查了
      // 文件类型 文件大小
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        this.$message.error('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
        return false
      }
      //   文件大小
      const maxSize = 25 * 1024 * 1024
      if (maxSize < file.size) {
        this.$message.error('图片最大的大小为5M')
        return false
      }
      return true // 要返回true
    },
    // 上传到腾讯云
    // 自定义上传动作
    upload(params) {
      // params中的file就是要上传的图片文件
      //   console.log(params.file)
      if (params.file) {
        this.showPercent = true // 显示进度条
        //   上传对象到腾讯云
        cos.putObject({
          Bucket: 'shuiruohanyu-1302806742', /* 每个人的存储桶名称 */
          Region: 'ap-nanjing', /* 存储桶所在地域，必须字段 */
          Key: params.file.name, /* 文件名称 */
          StorageClass: 'STANDARD', // 固定值
          Body: params.file, // 上传文件对象
          onProgress: (progressData) => {
            // console.log(progressData.percent * 100)
            this.percent = progressData.percent * 100
          }
        }, (err, data) => {
          console.log(err)
          if (data.statusCode === 200 && data.Location) {
            //   认为此时上传成功
            // 需要知道当前的这个地址是谁的url地址
            //  params.file.uid  => 当前上传文件的标识  如果找到了一一样的uid 就表示他们是一张图片
            console.log(this.fileList)
            // 这样相当于将原来的旧本地地址换成了新地址
            this.fileList = this.fileList.map(item => {
              // 将本地的地址替换成线上已经放在腾讯云之后的地址
              if (item.uid === params.file.uid) {
                // upload 为true的意思是 表示这张图片 已经上传过了 已经不是本地图片了
                return { url: 'http://' + data.Location, upload: true }
              }
              return item
            })
            this.showPercent = false // 关闭进度条
            this.percent = 0 // 将进度归0
          }
        })
      }
    }
  }
}
</script>

<style>
.disabled .el-upload--picture-card {
  display: none
}

</style>

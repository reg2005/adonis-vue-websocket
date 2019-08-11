<template>
  <div class="about">
    <h1>This is an about page</h1>
    <el-input v-model="message"/>
    <el-button @click="sendHello">Send!</el-button>
  </div>
</template>
<script>
const topicName = 'user:1'
export default {
  data() {
    return {
      message: 'Hello from about page!'
    }
  },
  mounted() {
    console.log('about mounted')
    this.$ws.$on(`${topicName}|ABOUT_MESSAGE`, this.handleAboutMessageEvent) 
    this.$ws.$on('ABOUT_MESSAGE', this.handleAboutMessageEvent)
  },
  beforeDestroy(){
    this.$ws.$off(`${topicName}|ABOUT_MESSAGE`, this.handleAboutMessageEvent);
    this.$ws.$off('ABOUT_MESSAGE', this.handleAboutMessageEvent);
  },
  methods: {
    handleAboutMessageEvent(data){
      this.$notify({
        title: "handled in src/views/About.vue 1",
        message: data.message
      })
    },
    sendHello(){
      this.$ws.$emitToServer(topicName, 'hello', {message: this.message})
    }
  }
}
</script>
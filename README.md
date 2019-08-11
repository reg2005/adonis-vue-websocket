# Adonis websocket client for VueJS
## How it works
This package add new layer for use original AdonisWSClient in your vue.js project:
```js
//For global acceess
Vue.ws

//In vue component
this.$ws
```
For example you can handle adonisWS events in your vue components:
```js
this.$ws.$on(`${topicName}|ABOUT_MESSAGE`, d => console.log(d)) 
```
Emit events from Vue components you can:
```js
//if this topic does not exist, $emitToServer automatic trying to create it
this.$ws.$emitToServer(topicName, 'hello', {message: 'message})
```

## Install
npm
```bash
npm install adonis-vue-websocket
```
yarn
```bash
yarn add adonis-vue-websocket
```
## Usage

### 1. Connect plugin
You can to plug original [AdonisWSClient](https://github.com/adonisjs/adonis-websocket-client) and connect with library:
```js
import Ws from '@adonisjs/websocket-client'
import WsPlugin from 'adonis-vue-websocket'
Vue.use(WsPlugin, { adonisWS: Ws })
```
Or

**I recommend this way:** add AdonisWS in index.html (for disable native AdonisJS logs):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.4.3/polyfill.min.js"></script>
<script src="https://unpkg.com/@adonisjs/websocket-client@1.0.9/dist/Ws.browser.min.js"></script>
```
and connect with library in main.js:
```js
import WsPlugin from 'adonis-vue-websocket'
Vue.use(WsPlugin, { adonisWS: window.adonis.Ws })
```

## 2. Init connection
Create file src/WsSubscriptions.js with content:
```js
import Vue from "vue";

const userTopicSubscriptions = id => {
  if (id) {
    let subscription = Vue.ws.socket.getSubscription(`user:${id}`);
    if (!subscription) {
      subscription = Vue.ws.subscribe(`user:${id}`);
    }
    subscription.on("HELLO_EVENT", data => {
      console.log('Hello (event handled in src/WsSubscriptions.js)', data)
    });
  }
};

export default async () => {
  return new Promise((resolve, reject) => {
    Vue.ws.disconnect()
    Vue.ws.connect(
        {
            wsDomain: "ws://localhost:3333", 
            jwtToken: null
        }, 
        { 
            path: 'adonis-ws', 
            reconnectionAttempts: 300, 
            reconnectionDelay: 5000 
        }
    );
    Vue.ws.socket.on("open", () => {
      userTopicSubscriptions(1);
      resolve()
    });
    
    // FOR EXAMPLE you can observe for userId or another variable from Vuex
    // store.watch(
    //   () => store.getters.vgUserUid,
    //   async id => {
    //     if (id) {
    //       userTopicSubscriptions(uid);
    //     }
    //   }
    // );
  })
};
```
In app.vue:
```js
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view v-if="!loading"/>
  </div>
</template>

<script>
import WsSubscriptions from './WsSubscriptions'
export default {
  data () {
    return {
      loading: true
    }
  },
  async created() {
    await WsSubscriptions()
    this.loading = false
  }
}
</script>
```
### 3. Handle and emit events
You can handle events in any .js and .vue files and components, for example in vue component:
```js
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
    this.$ws.$on(`${topicName}|ABOUT_MESSAGE`, this.handleAboutMessageEvent) 
    this.$ws.$on('ABOUT_MESSAGE', this.handleAboutMessageEvent)
  },
  beforeDestroy(){
    //Remove listeners when component destroy
    this.$ws.$off(`${topicName}|ABOUT_MESSAGE`, this.handleAboutMessageEvent);
    this.$ws.$off('ABOUT_MESSAGE', this.handleAboutMessageEvent);
  },
  methods: {
    handleAboutMessageEvent(data){
        console.log("handled in src/views/About.vue", data)
    },
    sendHello(){
      this.$ws.$emitToServer(topicName, 'hello', {message: this.message})
    }
  }
}
</script>
```

## Profit!

---

## Test
```bash
git clone https://github.com/reg2005/adonis-vue-websocket.git
cd adonis-vue-websocket
```
### In first terminal
```bash
cd example/back
cp .env.example .env
npm install
adonis serve --dev
```
### In second terminal
```bash
cd example/front 
npm install
yarn serve
```
And open front in your browser
import Vue from 'vue'

function anyListenerHelper () {
    this.anyListener(topic, ...arguments)
}

class WsPlugin extends Vue{
    constructor({adonisWS = null} = {}) {
        super()
        this.adonisWS = adonisWS
        this.connected = false
        this.socket = null
        this.onOpen = () => { }
    }
    anyListener (topic, event, data) {
        // console.log('WS_EVENTS', ...arguments)
        this.$emitToFront(`${topic}|${event}`, data)
        this.$emitToFront(`${event}`, data)
    }
    // Register a custom callback as meddler that gets called upon each event emission.
    // It can be bound to $on as well. 
    $onAny(callback) {
        this.meddler = callback
    }

    // Override Vue's $emit to call the custom meddler callback upon each event emission.
    $emitToFront(event, ...args) {
        if (this.meddler && typeof this.meddler.call === 'function') {
            this.meddler(event, ...args)
        }

        return super.$emit(event, ...args)
    }
    $emitToServer(subscriptionTopic, eventName, data = {}) {
        if(!this.socket){
            throw new Error('Socket is not connected')
        }
        if(!this.socket.ws){
            throw new Error('Socket is not ready, please check your internet connection')
        }
        // console.log('emitToServer subscriptionTopic:', subscriptionTopic)
        let subscription = this.socket.getSubscription(subscriptionTopic)
        if (!subscription) {
            subscription = this.socket.subscribe(subscriptionTopic);
        }
        subscription.emit(eventName, data)
    }
    connect({ wsDomain, jwtToken = null } = {}, options = {}) {
        if (!this.adonisWS || this.adonisWS === undefined) {
            throw new Error('Please define adonisWs in Vue.use(WsPlugin, { adonisWS: window.adonis.Ws })')
        }
        if (this.connected) {
            throw new Error('Socket is already connected')
        }
        const ws = new this.adonisWS(wsDomain, options)
        if (jwtToken) {
            ws.withJwtToken(jwtToken)
        }
        this.socket = ws.connect()
        this.socket.on('open', () => {
            // console.log('opened ws plugin')
            this.connected = true
            this.onOpen()
        })

        this.socket.on('close', async () => {
            // console.log('closed WS plugin')
            this.connected = false
        })

        this.socket.on('error', () => {
            // console.log('error WS plugin')
            this.connected = false
        })
        return this
    }
    subscribe(topic) {
        const subscription = this.socket.subscribe(topic)
        subscription.emitter.onAny((event, data) => {
            this.anyListener(topic, event, data)
        })
        subscription.on("close", () => {
            if (subscription.emitter){
                subscription.emitter.offAny(() => {
                    this.anyListener(topic)
                });
            }
        });
        return subscription
    }
    disconnect() {
        try {
            if (this.socket){
                this.socket.offAny(this.anyListener)
                this.socket.close()
                this.socket = null
            }
            this.connected = false

        } catch (e) {
            console.error('AdonisVueWs', e.message);
        }
    }
    onOpen(cb = () => { }) {
        this.onOpen = cb
    }
}

export default {
    install(Vue, opt) {
        Vue.ws = new WsPlugin(opt)
        Vue.prototype.$ws = Vue.ws
    }
}

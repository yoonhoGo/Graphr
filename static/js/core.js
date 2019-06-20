import { Core } from '@classroom/sdk'

export class CoreWrapper {
  constructor(serviceName) {
    this.serviceName =
      serviceName || `noname${Math.ceil(Math.random() * 1000000)}`
    this.core = new Core()
    this.store = {}
  }

  observer(name) {
    const eventName = `--graphr-store-${this.serviceName}-${name}`
    this.store[name] = {
      _eventName: eventName,
      _value: undefined,
      get value() {
        return this._value
      },
      set value(__value) {
        this._value = __value
        this.core.publish(eventName, this._value)
      }
    }
    this.core.subscribe(eventName, __value => {
      this.store[name]._value = __value
    })
    return this.store[name]
  }

  wrapper(eventName, eventListener) {
    // console.log(
    //   `TCL: CoreWrapper -> wrapper -> eventName, eventListener`,
    //   eventName,
    //   eventListener
    // )

    this.core.subscribe(eventName, args => {
      // console.log(`TCL: wrapper.subscribe -> args`, args)
      eventListener(...args.body)
    })
    return (...args) => {
      // console.log(`TCL: CoreWrapper -> wrapper.publish -> eventName`, eventName)
      // console.log(`TCL: CoreWrapper -> wrapper.publish -> args`, args)

      this.core.publish(eventName, args)
    }
  }
}

const a = core.observer()
a.get()
a.set()

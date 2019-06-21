import { Core } from '@classroom/sdk'

interface IStore {
  [key: string]: {
    _eventName: string,
    _value: any,
    value: any
  }
}

export class CoreWrapper {
  core = new Core()
  store: IStore = {}
  constructor(public serviceName: string = `noname${Math.ceil(Math.random() * 1000000)}`) {
  }

  observer(name, value) {
    const self = this
    const eventName = `--graphr-store-${this.serviceName}-${name}`
    const variable = this.store[name] = {
      _eventName: eventName,
      _value: undefined,
      get value() {
        return this._value
      },
      set value(__value: any) {
        this._value = __value
        self.core.publish(eventName, this._value)
      }
    }
    this.core.subscribe(eventName, __value => {
      variable._value = __value
    })
    variable.value = value
    return variable
  }

  wrapper(eventName: string, eventListener: (...args: any) => void) {
    // console.log(
    //   `TCL: CoreWrapper -> wrapper -> eventName, eventListener`,
    //   eventName,
    //   eventListener
    // )

    this.core.subscribe(eventName, (args) => {
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

export const core = new CoreWrapper()

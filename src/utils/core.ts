import { Core } from '@classroom/sdk'

interface IStore {
  [key: string]: {
    _eventName: string
    _value: any
    value: any
  }
}

export class CoreWrapper {
  appId = Math.ceil(Math.random() * 10 ** 12)
  core = new Core()

  wrapper(eventName: string, eventListener: (...args: any) => void) {
    // console.log(
    //   `TCL: CoreWrapper -> wrapper -> eventName, eventListener`,
    //   eventName,
    //   eventListener
    // )

    this.core.subscribe(eventName, args => {
      // console.log(`TCL: wrapper.subscribe -> args`, args)
      eventListener(...args.body)
    })
    return (...args: any[]) => {
      // console.log(`TCL: CoreWrapper -> wrapper.publish -> eventName`, eventName)
      // console.log(`TCL: CoreWrapper -> wrapper.publish -> args`, args)

      this.core.publish(eventName, args)
    }
  }

  /**
   * Comment
   *
   * @returns {MethodDecorator}
   */
  publish(): MethodDecorator {
    return (
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ): PropertyDescriptor => {
      let instance: any
      const self = this
      const handler = descriptor.value
      const eventName = `--graphr-${this.appId}-${
        target.constructor.name
      }-${String(propertyKey)}`
      descriptor.value = function(...args: any[]) {
        console.log('publish:', eventName)
        instance = this
        self.core.publish(eventName, args)
      }
      this.core.subscribe(eventName, args => {
        console.log('subscribe:', eventName)
        return handler.apply(instance, args.body)
      })
      return descriptor
    }
  }
}

export const core = new CoreWrapper()

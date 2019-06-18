import { Core } from '@classroom/sdk'

export class CoreWrapper {
  constructor() {
    this.core = new Core()
    this.subscribers = {}
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

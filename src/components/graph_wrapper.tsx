import React from 'react'
import { ISetProps } from 'src/App'
import { JSgCalc } from '../utils/jsgcalc'

export default class GraphWrapper extends React.Component<ISetProps> {
  render() {
    return (
      <div id='graph_wrapper'>
        <canvas id='graph' ref={this.onGraphInitialized}>
          Sorry, your browser does not support this application. The following
          browsers are supported:
          <br />
          <br />
          <a href='http://www.google.com/chrome/'>Google Chrome</a>
          <br />
          <a href='http://www.mozilla.com/firefox/'>Mozilla Firefox</a>
          <br />
          <a href='http://www.opera.com/'>Opera</a>
        </canvas>
      </div>
    )
  }

  onGraphInitialized = (instance: HTMLCanvasElement | null) => {
    if (!instance) {
      throw new Error('canvas instance가 생성되지 않았습니다')
    }
    const jsgCalc = new JSgCalc(instance)
    jsgCalc.jsgui = this.props.jsgui
    this.props.setJSgcalc(jsgCalc)
    this.props.jsgui.jsgcalc = jsgCalc
    jsgCalc.initCanvas()
  }
}

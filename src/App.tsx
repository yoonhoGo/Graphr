import React from 'react'
import GraphWrapper from './components/graph_wrapper'
import Sidewrapper from './components/sidewrapper'
import Toolbar from './components/toolbar'
import Toolboxes from './components/toolboxes'
import { core } from './utils/core'
import { JSgCalc } from './utils/jsgcalc'
import { JSgui, jsgui as _jsgui } from './utils/jsgui'

export interface ISetProps {
  jsgCalc: JSgCalc
  jsgui: JSgui
  setJSgcalc: (jsgcalc: JSgCalc) => void
  setJSgui: (jsgui: JSgui) => void
}

interface IAppState {
  jsgCalc: JSgCalc | null
  jsgui: JSgui
}

export default class App extends React.Component<{}, IAppState> {
  state: IAppState = {
    jsgCalc: null,
    jsgui: _jsgui
  }

  constructor(props: {}) {
    super(props)

    this.setJSgcalc = this.setJSgcalc.bind(this)
    this.setJSgui = this.setJSgui.bind(this)
  }

  setJSgcalc(jsgcalc: JSgCalc) {
    this.setState(prevState => ({
      ...prevState,
      jsgcalc
    }))
  }

  setJSgui(jsgui: JSgui) {
    this.setState(prevState => ({
      ...prevState,
      jsgui
    }))
  }

  render() {
    const { jsgui, jsgCalc } = this.state
    return (
      <div id='wrapper'>
        <div id='hideSidebar'>
          <a href='javascript:void(0)' onClick={() => jsgui.hideSidebar()}>
            &raquo;
          </a>
        </div>
        <div id='showSidebar'>
          <a href='javascript:void(0)' onClick={() => jsgui.showSidebar()}>
            &laquo;
          </a>
        </div>

        <Toolbar
          jsgCalc={jsgCalc as JSgCalc}
          jsgui={jsgui}
          setJSgcalc={this.setJSgcalc}
          setJSgui={this.setJSgui}
        />
        <Toolboxes
          jsgCalc={jsgCalc as JSgCalc}
          jsgui={jsgui}
          setJSgcalc={this.setJSgcalc}
          setJSgui={this.setJSgui}
        />
        <Sidewrapper
          jsgCalc={jsgCalc as JSgCalc}
          jsgui={jsgui}
          setJSgcalc={this.setJSgcalc}
          setJSgui={this.setJSgui}
        />
        <GraphWrapper
          jsgCalc={jsgCalc as JSgCalc}
          jsgui={jsgui}
          setJSgcalc={this.setJSgcalc}
          setJSgui={this.setJSgui}
        />
      </div>
    )
  }

  componentDidMount() {
    core.core.on('initialized', () => {
      console.log('Everybody Hi!')
      this.state.jsgui.addInput()
      $('.toolbox_close a').click(() => {
        $('.toolbox').hide()
      })

      document.body.onselectstart = () => {
        return false
      }
    })
  }
}

import React from 'react'
import GraphWrapper from './components/graph_wrapper'
import Sidewrapper from './components/sidewrapper'
import Toolbar from './components/toolbar'
import Toolboxes from './components/toolboxes'

import { JSgCalc } from '../static/js/jsgcalc'

declare const window: any

export default class App extends React.Component {
  render() {
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

        <Toolbar />
        <Toolboxes />
        <Sidewrapper />
        <GraphWrapper />
      </div>
    )
  }

  componentDidMount() {
    window.jsgcalc = new JSgCalc('graph')
    window.jsgcalc.initCanvas()
  }
}

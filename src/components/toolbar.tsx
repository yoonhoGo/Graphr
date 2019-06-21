import React from 'react'
import { ISetProps } from 'src/App'
import DerivativeImage from '../../images/derivative.png'
import IntersectImage from '../../images/intersect.png'
import MinmaxImage from '../../images/minmax.png'
import PointerImage from '../../images/pointer.png'
import RootImage from '../../images/root.png'
import TraceImage from '../../images/trace.png'
import ZoomboxImage from '../../images/zoombox.png'
import ZoominImage from '../../images/zoomin.png'
import ZoomoutImage from '../../images/zoomout.png'
import { jsgui } from '../utils/jsgui'

export default class SideWrapper extends React.Component<ISetProps> {
  render() {
    return (
      <div id='toolbar'>
        <div id='tool_select'>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('pointer')}
            id='tool_select_pointer'
            className='toolbar_option toolbar_selected'
          >
            <img src={PointerImage} alt='Pointer' title='Pointer' />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('trace')}
            id='tool_select_trace'
            className='toolbar_option'
          >
            <img src={TraceImage} alt='Trace' title='Trace' />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('vertex')}
            id='tool_select_vertex'
            className='toolbar_option'
          >
            <img
              src={MinmaxImage}
              alt='Local Minima/Maxima'
              title='Local Minima/Maxima'
            />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('root')}
            id='tool_select_root'
            className='toolbar_option'
          >
            <img src={RootImage} alt='Root' title='Root' />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('intersect')}
            id='tool_select_intersect'
            className='toolbar_option'
          >
            <img src={IntersectImage} alt='Intersect' title='Intersect' />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('derivative')}
            id='tool_select_derivative'
            className='toolbar_option'
          >
            <img src={DerivativeImage} alt='Derivative' title='Derivative' />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('zoombox')}
            id='tool_select_zoombox'
            className='toolbar_option'
          >
            <img src={ZoomboxImage} alt='ZoomBox' title='ZoomBox' />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('zoomin')}
            id='tool_select_zoomin'
            className='toolbar_option'
          >
            <img src={ZoominImage} alt='Zoom In' title='Zoom In' />
          </a>
          <a
            href='javascript:void(0)'
            onClick={() => jsgui.setTool('zoomout')}
            id='tool_select_zoomout'
            className='toolbar_option'
          >
            <img src={ZoomoutImage} alt='Zoom Out' title='Zoom Out' />
          </a>
        </div>
      </div>
    )
  }
}

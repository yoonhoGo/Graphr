import React from 'react'
export default () => {
  return (
    <div id='toolbar'>
      <div id='tool_select'>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('pointer')}
          id='tool_select_pointer'
          className='toolbar_option toolbar_selected'
        >
          <img src='images/pointer.png' alt='Pointer' title='Pointer' />
        </a>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('trace')}
          id='tool_select_trace'
          className='toolbar_option'
        >
          <img src='images/trace.png' alt='Trace' title='Trace' />
        </a>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('vertex')}
          id='tool_select_vertex'
          className='toolbar_option'
        >
          <img
            src='images/minmax.png'
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
          <img src='images/root.png' alt='Root' title='Root' />
        </a>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('intersect')}
          id='tool_select_intersect'
          className='toolbar_option'
        >
          <img src='images/intersect.png' alt='Intersect' title='Intersect' />
        </a>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('derivative')}
          id='tool_select_derivative'
          className='toolbar_option'
        >
          <img
            src='images/derivative.png'
            alt='Derivative'
            title='Derivative'
          />
        </a>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('zoombox')}
          id='tool_select_zoombox'
          className='toolbar_option'
        >
          <img src='images/zoombox.png' alt='ZoomBox' title='ZoomBox' />
        </a>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('zoomin')}
          id='tool_select_zoomin'
          className='toolbar_option'
        >
          <img src='images/zoomin.png' alt='Zoom In' title='Zoom In' />
        </a>
        <a
          href='javascript:void(0)'
          onClick={() => jsgui.setTool('zoomout')}
          id='tool_select_zoomout'
          className='toolbar_option'
        >
          <img src='images/zoomout.png' alt='Zoom Out' title='Zoom Out' />
        </a>
      </div>
    </div>
  )
}

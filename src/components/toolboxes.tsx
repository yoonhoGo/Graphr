import React from 'react'
import GraphImage from '../../images/graph.png'

export default () => {
  return (
    <div id='toolboxes'>
      <div className='toolbox' id='toolbox_zoombox'>
        <div className='toolbox_header'>
          <div className='toolbox_close'>
            <a href='javascript: void(0)'>close</a>
          </div>
          Window Options
        </div>

        <div className='toolbox_main'>
          <table>
            <tbody>
              <tr>
                <td />
                <td align='center'>
                  y-max:
                  <input
                    id='toolbox_zoombox_ymax'
                    className='jsgcalc_ymax'
                    type='text'
                    size={4}
                  />
                </td>
                <td />
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td>
                  x-min:
                  <br />
                  <input
                    id='toolbox_zoombox_xmin'
                    className='jsgcalc_xmin'
                    type='text'
                    size={4}
                  />
                </td>
                <td align='center'>
                  <img src={GraphImage} style={{ width: '70px' }} />
                </td>
                <td>
                  x-max:
                  <br />
                  <input
                    id='toolbox_zoombox_xmax'
                    className='jsgcalc_xmax'
                    type='text'
                    size={4}
                  />
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td />
                <td align='center'>
                  y-min:
                  <input
                    id='toolbox_zoombox_ymin'
                    className='jsgcalc_ymin'
                    type='text'
                    size={4}
                  />
                </td>
                <td />
              </tr>
            </tbody>
          </table>

          <a
            className='fancybutton'
            href='javascript: void(0)'
            onClick={() => {jsgcalc.setWindow($('#toolbox_zoombox_xmin').val(), $('#toolbox_zoombox_xmax').val(), $('#toolbox_zoombox_ymin').val(), $('#toolbox_zoombox_ymax').val())}}
          >
            Apply
          </a>
          <br />
          <br />
          <a href='javascript: void(0);' onClick={() => {jsgcalc.resetZoom()}}>
            Reset View
          </a>
        </div>
      </div>

      <div className='toolbox' id='toolbox_trace'>
        <div className='toolbox_header'>
          <div className='toolbox_close'>
            <a href='javascript: void(0)'>close</a>
          </div>
          Trace
        </div>

        <div className='toolbox_main'>
          x:
          <input
            id='toolbox_trace_input'
            className='jsgcalc_trace_input'
            type='text'
            size={20}
            style={{ width: '95%' }}
          />
          <br />
          y:
          <input
            id='toolbox_trace_output'
            className='jsgcalc_trace_output'
            type='text'
            size={20}
            style={{ width: '95%' }}
          />
          <br />
          <br />
          <a
            className='fancybutton'
            href='javascript: void(0)'
            onClick={() => {jsgui.doTrace($('#toolbox_trace_input').val())}}
          >
            Trace
          </a>
          <br />
        </div>
      </div>
    </div>
  )
}

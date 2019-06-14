import React from 'react'
export default () => {
  return (
    <div id='sidewrapper'>
      <div id='graph_sidebar'>
        <h1
          style={{
            fontFamily: 'Lato, Arial, sans-serif',
            fontStyle: 'italic',
            fontSize: '28pt',
            color: '#3d94f6',
            textShadow: '1px 1px #FFF'
          }}
        >
          Graphr
        </h1>
        <span
          style={{
            fontSize: '90%',
            position: 'relative',
            bottom: '4px'
          }}
        >
          <em>The JavaScript Graphing Calculator</em>{' '}
        </span>
        <br />
        <br />

        <div id='graph_inputs' />
        <br />
        <div id='buttonbar'>
          <a
            className='fancybutton'
            href='javascript:void(0)'
            onClick={() => jsgui.evaluate()}
          >
            Evaluate
          </a>
          <a
            className='fancybutton'
            href='javascript:void(0)'
            onClick={() => jsgui.addInput()}
          >
            +
          </a>
          <a
            className='fancybutton greybutton'
            href='javascript:void(0)'
            id='settings_button'
            onClick={() => $('#settings').toggle(400)}
          >
            <img src='images/settings.png' alt='Settings' />
          </a>
          <br />
          <br />
        </div>

        <div id='settings'>
          <div id='angle_select' className='options_list'>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setAngles('degrees')}
              id='angle_select_degrees'
              className='option'
            >
              DEG
            </a>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setAngles('radians')}
              id='angle_select_radians'
              className='option option_selected'
            >
              RAD
            </a>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setAngles('gradians')}
              id='angle_select_gradians'
              className='option'
            >
              GRAD
            </a>
          </div>

          <div id='gridlines_select' className='options_list'>
            Gridlines:
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setGridlines('normal')}
              id='gridlines_select_normal'
              className='option option_selected'
            >
              NORMAL
            </a>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setGridlines('less')}
              id='gridlines_select_less'
              className='option'
            >
              LESS
            </a>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setGridlines('off')}
              id='gridlines_select_off'
              className='option'
            >
              OFF
            </a>
          </div>

          <div id='quality_select' className='options_list'>
            Precision:
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setQuality(0.1)}
              id='quality_select_01'
              className='option'
            >
              LOW
            </a>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setQuality(0.5)}
              id='quality_select_05'
              className='option'
            >
              MED
            </a>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setQuality(1)}
              id='quality_select_1'
              className='option option_selected'
            >
              HIGH
            </a>
            <a
              href='javascript:void(0)'
              onClick={() => jsgui.setQuality(5)}
              id='quality_select_5'
              className='option'
            >
              ULTRA
            </a>
          </div>
        </div>

        <p>
          By <a href='http://www.yerich.net'>Richard Ye</a> |
          <a href='javascript: void(0);' onClick={() => about()}>
            Disclaimer
          </a>{' '}
          |<a href='https://github.com/yerich/Graphr'>GitHub</a>
          <br />
          <span
            style={{
              color: '#999'
            }}
          >
            Development (version 0.4)
          </span>
        </p>
      </div>
    </div>
  )
}

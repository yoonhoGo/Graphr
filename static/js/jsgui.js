const { widthPlusPadding, JSgCalc } = require('./jsgcalc')
const { CoreWrapper } = require('./core')

function JSgui() {
  this.core = new CoreWrapper()
  this.currInput = 0
  this.lineColors = {
    '#FF0000': -1,
    '#0000FF': -1,
    '#00FF00': -1,
    '#FF00FF': -1,
    '#00FFFF': -1,
    '#000000': -1,
    '#990000': -1,
    '#000099': -1,
    '#009900': -1,
    '#999900': -1,
    '#990099': -1,
    '#009999': -1
  }
  this.lineSettings = { 0: { color: '#FF0000' } }
  this.currtool = 'pointer'
  this.currEq = 0
  this.gridlines = 'normal'
  this.settings = {}

  this.setQuality = this.core.wrapper('--graphr-setQuality', q => {
    $('#quality_select a').removeClass('option_selected')
    q2 = String(q).replace('.', '')
    $('#quality_select_' + q2).addClass('option_selected')

    window.jsgcalc.quality = q
    window.jsgcalc.draw()
  })

  this.setAngles = this.core.wrapper('--graphr-setAngles', q => {
    $('#angle_select a').removeClass('option_selected')
    $('#angle_select_' + q).addClass('option_selected')

    Calc.angles = q
    window.jsgcalc.draw()
  })

  this.selectEquation = this.core.wrapper('--graphr-selectEquation', x => {
    this.currEq = x
    $('#graph_inputs div.graph_input_wrapper').removeClass('active_equation')
    $('#graph_input_wrapper_' + x).addClass('active_equation')
    window.jsgcalc.draw()
  })

  this.setTool = this.core.wrapper('--graphr-setTool', t => {
    $('#tool_select a').removeClass('toolbar_selected')
    $('#tool_select_' + t).addClass('toolbar_selected')

    //Toolbox
    $('.toolbox').hide()
    $('#toolbox_' + t).show()
    $('#toolbox_' + t).css('top', $('#tool_select_' + t).offset().top - 23)
    $('#toolbox_' + t).css(
      'right',
      $(document).width() - $('#tool_select_' + t).offset().left + 5
    )

    this.currtool = t
    window.jsgcalc.draw()
  })

  this.doTrace = this.core.wrapper('--graphr-doTrace', xval => {
    window.jsgcalc.draw()
    window.jsgcalc.drawTrace(window.jsgcalc.getEquation(this.currEq), '#000000', xval)
  })

  this.setGridlines = this.core.wrapper('--graphr-setGridlines', t => {
    $('#gridlines_select a').removeClass('option_selected')
    $('#gridlines_select_' + t).addClass('option_selected')

    this.gridlines = t
    window.jsgcalc.draw()
  })

  this.hideSidebar = this.core.wrapper('--graphr-hideSidebar', () => {
    $('#sidewrapper').hide()
    $('#hideSidebar').hide()
    $('#showSidebar').show()
    $('#toolbar').css('right', '0px')
    window.jsgcalc.resizeGraph(
      $('#wrapper').width() - widthPlusPadding('#toolbar'),
      $('#wrapper').height()
    )

    this.setTool(this.currtool)
  })

  this.showSidebar = this.core.wrapper('--graphr-showSidebar', () => {
    $('#sidewrapper').show()
    $('#hideSidebar').show()
    $('#showSidebar').hide()
    $('#toolbar').css('right', '252px')
    window.jsgcalc.resizeGraph(
      $('#wrapper').width() -
        $('#sidewrapper').width() -
        widthPlusPadding('#toolbar'),
      $('#wrapper').height()
    )

    this.setTool(this.currtool)
  })

  this.updateInputData = () => {
    window.jsgcalc.lines = []
    $('#graph_inputs div.graph_input_wrapper').each(function() {
      window.jsgcalc.lines.push({
        equation: $('input', this).val(),
        color: $('.graph_color_indicator', this).css('backgroundColor')
      })
    })
  }

  this.evaluate = this.core.wrapper('--graphr-evaluate', () => {
    this.updateInputData()
    window.jsgcalc.draw()
    this.refreshInputs(window.jsgcalc.lines)
    // this.core.core.publish('--graphr-equations', window.jsgcalc.lines)
  })

  this.findAvailableColor = () => {
    for (var color in this.lineColors) {
      if (this.lineColors[color] == -1) return color
    }
  }

  //Update gui values
  this.updateValues = this.core.wrapper('--graphr-updateValues', () => {
    $('input.jsgcalc_xmin').val(Math.round(window.jsgcalc.currCoord.x1 * 1000) / 1000)
    $('input.jsgcalc_xmax').val(Math.round(window.jsgcalc.currCoord.x2 * 1000) / 1000)
    $('input.jsgcalc_ymin').val(Math.round(window.jsgcalc.currCoord.y1 * 1000) / 1000)
    $('input.jsgcalc_ymax').val(Math.round(window.jsgcalc.currCoord.y2 * 1000) / 1000)
  })

  this.addInput = this.core.wrapper('--graphr-addInput', () => {
    this.updateInputData()
    var newcolor = this.findAvailableColor()
    this.lineColors[newcolor] = this.currInput
    window.jsgcalc.lines.push({
      equation: '',
      color: newcolor
    })
    this.currInput++
    this.refreshInputs(window.jsgcalc.lines)
    // this.core.core.publish('--graphr-equations', window.jsgcalc.lines)
  })

  this.refreshInputs = this.core.wrapper('--graphr-refreshInputs', (equations) => {
    console.log(`TCL: JSgui -> equations`, equations)
    // var equations = window.jsgcalc.lines

    $('#graph_inputs').html('')
    for (i in equations) {
      $('#graph_inputs').append(
        '<div id="graph_input_wrapper_' +
          i +
          '" class="graph_input_wrapper">' +
          '<div class="graph_color_indicator" id="graph_color_indicator_' +
          i +
          '"></div>' +
          '<div class="graph_equation_display"><span>y =</span><input id="graph_input_' +
          i +
          '" size="20" value="' +
          equations[i].equation +
          '"/></div></div>'
      )
      $('#graph_color_indicator_' + i).css(
        'backgroundColor',
        equations[i].color
      )
      this.lineColors[equations[i].color] = i
    }

    $('#graph_inputs div.graph_input_wrapper').each(function() {
      $(this).bind('click', function() {
        var id = $(this).attr('id')
        var num = String(id).replace('graph_input_wrapper_', '')
        jsgui.selectEquation(num)
      })
    })

    this.currInput = i + 1

    $('#graph_input_wrapper_' + this.currEq).addClass('active_equation')
  })
}

jsgui = new JSgui()

$(document).ready(function() {
  jsgui.core.core.on('initialized', () => {
    console.log('Everybody Hi!')
    jsgui.addInput()
    $('.toolbox_close a').click(function() {
      $('.toolbox').hide()
    })

    document.body.onselectstart = function() {
      return false
    }

    window.jsgcalc = new JSgCalc('graph')
    window.jsgcalc.initCanvas()
  })
})

module.exports = {
  JSgui,
  jsgui
}

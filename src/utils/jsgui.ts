import { calc } from './calc'
import { JSgCalc, widthPlusPadding } from './jsgcalc'

export interface IEquation {
  color:
    | '#FF0000'
    | '#0000FF'
    | '#00FF00'
    | '#FF00FF'
    | '#00FFFF'
    | '#000000'
    | '#990000'
    | '#000099'
    | '#009900'
    | '#999900'
    | '#990099'
    | '#009999'
  equation: string
}

export class JSgui {
  currInput = 0
  lineColors = {
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
  lineSettings = { 0: { color: '#FF0000' } }
  currtool = 'pointer'
  currEq = 0
  gridlines = 'normal'
  settings = {}
  _jscalc: JSgCalc | null = null

  constructor() {}

  get jsgcalc() {
    if (!this._jscalc) {
      throw new Error('jsgcalc가 inject되지 않았습니다')
    }
    return this._jscalc
  }

  set jsgcalc(__jscalc: JSgCalc) {
    this._jscalc = __jscalc
  }

  // @core.core.publish('--graphr-setQuality')
  setQuality(q: number) {
    $('#quality_select a').removeClass('option_selected')
    const q2 = String(q).replace('.', '')
    $('#quality_select_' + q2).addClass('option_selected')

    this.jsgcalc.quality = q
    this.jsgcalc.draw()
  }

  // @core.core.publish('--graphr-setAngles')
  setAngles(q: string) {
    $('#angle_select a').removeClass('option_selected')
    $('#angle_select_' + q).addClass('option_selected')

    calc.angles = q
    this.jsgcalc.draw()
  }

  // @core.core.publish('--graphr-selectEquation')
  selectEquation(x: number) {
    this.currEq = x
    $('#graph_inputs div.graph_input_wrapper').removeClass('active_equation')
    $('#graph_input_wrapper_' + x).addClass('active_equation')
    this.jsgcalc.draw()
  }

  // @core.core.publish('--graphr-setTool')
  setTool(t: string) {
    $('#tool_select a').removeClass('toolbar_selected')
    $('#tool_select_' + t).addClass('toolbar_selected')

    // Toolbox
    $('.toolbox').hide()
    $('#toolbox_' + t).show()
    $('#toolbox_' + t).css('top', $('#tool_select_' + t).offset().top - 23)
    $('#toolbox_' + t).css(
      'right',
      $(document).width() - $('#tool_select_' + t).offset().left + 5
    )

    this.currtool = t
    this.jsgcalc.draw()
  }

  // @core.core.wrapper('--graphr-doTrace')
  doTrace(xval: number) {
    this.jsgcalc.draw()
    this.jsgcalc.drawTrace(
      this.jsgcalc.getEquation(this.currEq),
      '#000000',
      xval
    )
  }

  // @core.core.publish('--graphr-setGridlines')
  setGridlines(t: string) {
    $('#gridlines_select a').removeClass('option_selected')
    $('#gridlines_select_' + t).addClass('option_selected')

    this.gridlines = t
    this.jsgcalc.draw()
  }

  // @core.core.publish('--graphr-hideSidebar')
  hideSidebar() {
    $('#sidewrapper').hide()
    $('#hideSidebar').hide()
    $('#showSidebar').show()
    $('#toolbar').css('right', '0px')
    this.jsgcalc.resizeGraph(
      $('#wrapper').width() - widthPlusPadding('#toolbar'),
      $('#wrapper').height()
    )

    this.setTool(this.currtool)
  }

  // @core.core.wrapper('--graphr-showSidebar')
  showSidebar() {
    $('#sidewrapper').show()
    $('#hideSidebar').show()
    $('#showSidebar').hide()
    $('#toolbar').css('right', '252px')
    this.jsgcalc.resizeGraph(
      $('#wrapper').width() -
        $('#sidewrapper').width() -
        widthPlusPadding('#toolbar'),
      $('#wrapper').height()
    )

    this.setTool(this.currtool)
  }

  updateInputData() {
    this.jsgcalc.lines = []
    const self = this
    $('#graph_inputs div.graph_input_wrapper').each(function() {
      self.jsgcalc.lines.push({
        color: $('.graph_color_indicator', this).css('backgroundColor'),
        equation: $('input', this).val()
      })
    })
  }

  // @core.core.wrapper('--graphr-evaluate')
  evaluate() {
    this.updateInputData()
    this.jsgcalc.draw()
    this.refreshInputs(this.jsgcalc.lines)
    // core.core.publish('--graphr-equations', this.jsgcalc.lines)
  }

  findAvailableColor(): IEquation['color'] {
    for (const color in this.lineColors) {
      if (this.lineColors[color as IEquation['color']] == -1) {
        return color as IEquation['color']
      }
    }
    return '#000000'
  }

  // Update gui values
  // @core.core.wrapper('--graphr-updateValues')
  updateValues() {
    $('input.jsgcalc_xmin').val(
      Math.round(this.jsgcalc.currCoord.x1 * 1000) / 1000
    )
    $('input.jsgcalc_xmax').val(
      Math.round(this.jsgcalc.currCoord.x2 * 1000) / 1000
    )
    $('input.jsgcalc_ymin').val(
      Math.round(this.jsgcalc.currCoord.y1 * 1000) / 1000
    )
    $('input.jsgcalc_ymax').val(
      Math.round(this.jsgcalc.currCoord.y2 * 1000) / 1000
    )
  }

  // @core.core.wrapper('--graphr-addInput')
  addInput() {
    this.updateInputData()
    const newcolor = this.findAvailableColor()
    this.lineColors[newcolor] = this.currInput
    this.jsgcalc.lines.push({
      equation: '',
      color: newcolor
    })
    this.currInput++
    this.refreshInputs(this.jsgcalc.lines)
    // core.core.publish('--graphr-equations', this.jsgcalc.lines)
  }

  // @core.core.wrapper('--graphr-refreshInputs')
  refreshInputs(equations: IEquation[]) {
    console.log(`TCL: JSgui -> equations`, equations)
    // var equations = this.jsgcalc.lines

    $('#graph_inputs').html('')
    equations.forEach((equation, index) => {
      $('#graph_inputs').append(
        '<div id="graph_input_wrapper_' +
          index +
          '" class="graph_input_wrapper">' +
          '<div class="graph_color_indicator" id="graph_color_indicator_' +
          index +
          '"></div>' +
          '<div class="graph_equation_display"><span>y =</span><input id="graph_input_' +
          index +
          '" size="20" value="' +
          equation.equation +
          '"/></div></div>'
      )
      $('#graph_color_indicator_' + index).css(
        'backgroundColor',
        equation.color
      )
      this.lineColors[equation.color] = index
      this.currInput = index + 1
    })

    const self = this
    $('#graph_inputs div.graph_input_wrapper').each(function() {
      $(this).bind('click', function() {
        const id = $(this).attr('id')
        const num = Number(String(id).replace('graph_input_wrapper_', ''))
        self.selectEquation(num)
      })
    })

    $('#graph_input_wrapper_' + this.currEq).addClass('active_equation')
  }
}

export const jsgui = new JSgui()

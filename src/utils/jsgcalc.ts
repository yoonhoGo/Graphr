import { calc } from './calc'
import { IEquation, JSgui } from './jsgui'

export function dump(text: any) {
  console.log(text)
}

export function float_fix(num: number) {
  // Rounds floating points
  return Math.round(num * 10000000) / 10000000
}

export function widthPlusPadding(elem: string) {
  return (
    ($(elem).width() || 0) +
    parseFloat($(elem).css('paddingRight')) +
    parseFloat($(elem).css('paddingLeft'))
  )
}

export class JSgCalc {
  ctx: any
  width: number = $('#wrapper').width() || 0
  height: number = $('#wrapper').height() || 0
  maxgridlines = { x: 13, y: 13 }
  charHeight = 8
  startDrag = { x: 0, y: 0 }
  prevDrag = { x: 0, y: 0 }
  startCoord = { x1: 0, y1: 0, x2: 0, y2: 0 }
  currCoord = { x1: -5, y1: -5, x2: 5, y2: 5 }
  mousebutton = 0
  canvasX: number
  canvasY: number
  calccache: {
    [key: string]: any
  } = new Object()
  quality = 1
  zoomFactor = 0.1
  lines: IEquation[] = []
  fillareapath: Array<[number, number]> = []
  xgridscale: number = 0
  ygridscale: number = 0
  _jsgui: JSgui | null = null

  constructor(public graph: HTMLCanvasElement) {
    if (!graph) {
      throw new Error(`Not found canvas element`)
    }
    this.canvasX = this.graph.offsetLeft
    this.canvasY = this.graph.offsetTop
  }

  get jsgui() {
    if (!this._jsgui) {
      throw new Error('jsgui가 inject되지 않았습니다')
    }
    return this._jsgui
  }

  set jsgui(__jsgui: JSgui) {
    this._jsgui = __jsgui
  }

  arbRound(value: number, roundTo: number) {
    return Math.round(value / roundTo) * roundTo
  }

  arbFloor(value: number, roundTo: number) {
    return Math.floor(value / roundTo) * roundTo
  }

  copyCoord(coord: { x1: number; y1: number; x2: number; y2: number }) {
    // return { x1: coord.x1, y1: coord.y1, x2: coord.x2, y2: coord.y2 }
    return { ...coord }
  }

  clearScreen() {
    this.ctx.fillStyle = 'rgb(255,255,255)'
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  getEquation(lineid: number) {
    if (this.lines[lineid]) {
      return this.lines[lineid].equation
    }
    return
  }

  getColor(lineid: number) {
    if (this.lines[lineid]) {
      return this.lines[lineid].color
    }
    return '#000000'
  }

  drawEquation(equation: string, color: string, thickness: number) {
    if (!equation) {
      return false
    }

    const x1 = this.currCoord.x1
    const x2 = this.currCoord.x2
    const y1 = this.currCoord.y1
    const y2 = this.currCoord.y2

    const xrange = x2 - x1
    const yrange = y2 - y1

    const scale = this.getScale()

    if (!this.calccache[equation]) {
      this.calccache[equation] = new Object()
    }

    this.ctx.strokeStyle = color
    const oldLinewidth = this.ctx.linewidth
    if (thickness) {
      this.ctx.linewidth = thickness
    }
    this.ctx.beginPath()
    // We don't want to draw lines that go off the screen too much, so we keep track of how many times we've had
    // to go off the screen here
    let lineExists = 0
    let lastpoint = 0

    this.fillareapath = []
    this.fillareapath.push([0, this.height - -y1 * scale.y])
    // Loop through each pixel

    const inverseQuality = 1.0 / this.quality
    const inverseScaleX = 1.0 / scale.x

    const maxxval = this.width + inverseQuality

    const f = calc.makeFunction(equation)

    for (let i = 0; i < maxxval; i += inverseQuality) {
      const xval = i * inverseScaleX + x1 // calculate the x-value for a given pixel
      const yval: number = f(xval)

      const ypos = this.height - (yval - y1) * scale.y
      // The line is on the screen, or pretty close to it
      if (ypos >= this.height * -1 && ypos <= this.height * 2) {
        if (lineExists > 1) {
          this.ctx.beginPath()
        }

        if (
          Boolean(lastpoint) !== false &&
          ((lastpoint > 0 && yval < 0) || (lastpoint < 0 && yval > 0))
        ) {
          this.ctx.moveTo(i, ypos)
        } else {
          this.ctx.lineTo(i, ypos)
        }

        lineExists = 0
        lastpoint = 0
      } else if (lineExists <= 1) {
        // The line is off the screen
        this.ctx.lineTo(i, ypos)
        lastpoint = yval
        this.ctx.stroke()
        lineExists++
      }
      this.fillareapath.push([i, ypos])
      // this.ctx.fillRect(i - 0.5, ypos - 0.5, 1, 1);
    }
    this.fillareapath.push([maxxval, this.height - -y1 * scale.y])
    this.ctx.stroke()
    this.ctx.linewidth = oldLinewidth
  }

  drawFillArea() {
    if (this.fillareapath.length < 1) {
      return
    }

    this.ctx.beginPath()
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    for (let i = 0; i < this.fillareapath.length; i++) {
      if (i === 0) {
        this.ctx.lineTo(this.fillareapath[i][0], this.fillareapath[i][1])
      } else {
        this.ctx.lineTo(this.fillareapath[i][0], this.fillareapath[i][1])
      }
    }
    this.ctx.fill()
  }

  // Draws an arbritrary straight line from (x1, y1) to (x2, y2)
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color?: string,
    thickness?: number
  ) {
    if (!color) {
      color = '#000000'
    }

    this.ctx.strokeStyle = color
    this.ctx.beginPath()
    const start = this.getCoord(x1, y1)
    const end = this.getCoord(x2, y2)
    this.ctx.moveTo(start.x, start.y)
    this.ctx.lineTo(end.x, end.y)

    const tmp = this.ctx.lineWidth
    if (thickness) {
      this.ctx.lineWidth = thickness
    }

    this.ctx.stroke()
    this.ctx.lineWidth = tmp
  }

  // Draws an arbritrary label on the graph, given the numeric values (rather than the pixel values)
  drawLabel(xval: number, yval: number, text: string, color?: string) {
    if (!color) {
      color = '#000000'
    }

    const labelCoord = this.getCoord(xval, yval)
    let xpos = labelCoord.x
    let ypos = labelCoord.y

    this.ctx.font = "12pt 'open sans'"
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(xpos, ypos)

    if (ypos - 4 < this.charHeight) {
      ypos += this.charHeight * 2
    }
    const textwidth = this.ctx.measureText(text).width
    if (xpos - 4 < textwidth) {
      xpos += textwidth + 3
    }
    this.ctx.fillText(text, xpos - 3, ypos - 3)
  }

  drawDot(xval: number, yval: number, color: string, radius: number) {
    if (!radius) {
      radius = 4
    }
    if (!color) {
      color = '#000000'
    }

    const coord = this.getCoord(xval, yval)
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    this.ctx.arc(coord.x, coord.y, radius, 0, Math.PI * 2, false)
    this.ctx.fill()
  }

  // Draws thge vertex of an equation (i.e. when it changes direction)
  drawVertex(equation: string | undefined, color: string, x: number) {
    if (!equation) {
      return false
    }
    const f = calc.makeFunction(equation)

    const scale = this.getScale()
    const xpos = x / scale.x + this.currCoord.x1
    const matchingDist = 20 / scale.x
    let answer = calc.getVertex(
      f,
      xpos - matchingDist,
      xpos + matchingDist,
      0.0000001
    )
    let tries = 0
    while (answer === false) {
      tries++
      if (tries > 5) {
        return false
      }
      answer = calc.getVertex(
        f,
        xpos - matchingDist - Math.random() / 100,
        xpos + matchingDist + Math.random() / 100,
        0.0000001
      )
    }
    const xval = calc.roundFloat(answer)
    let yval = f(xval)
    yval = calc.roundFloat(this.arbRound(yval, 0.0000001))
    this.drawDot(xval, yval, color, 4)

    // draw label text
    this.drawLabel(
      xval,
      yval,
      calc.roundFloat(this.arbRound(xval, 0.0000001)) + ', ' + yval,
      '#000000'
    )
  }

  // Draws the root of an equation (i.e. where x=0)
  drawRoot(equation: string | undefined, color: string, x: number) {
    if (!equation) {
      return false
    }

    const scale = this.getScale()
    const xpos = x / scale.x + this.currCoord.x1
    // Calculate the root (within 50 pixels)
    let answer = calc.getRoot(equation, xpos, 50 / scale.x)
    if (answer === false) {
      return false
    }

    answer = Math.round(answer * 10000000) / 10000000

    const xval = calc.roundFloat(answer)
    const yval = 0

    this.drawDot(xval, yval, color, 4) // draw the dot
    // draw label text
    this.drawLabel(
      xval,
      yval,
      calc.roundFloat(this.arbRound(xval, 0.00000001)) + ', ' + yval
    )
  }

  // draws the intersection of an equation and the nearest equation to the mouse pointer
  drawIntersect(equation1: string | undefined, color: string, x: number) {
    // if (!equation) return false

    const scale = this.getScale()
    const xpos = x / scale.x + this.currCoord.x1
    let equation: string | undefined

    let answer: number | false = false
    this.lines.forEach((line, i) => {
      if (this.getEquation(i) == equation1) {
        return
      }

      let tempanswer = calc.getIntersection(
        equation1 as string,
        this.getEquation(i) as string,
        xpos,
        50 / scale.x
      )
      if (tempanswer === false) {
        return
      }
      tempanswer = Math.round(tempanswer * 10000000) / 10000000
      dump(tempanswer)
      if (
        // tempanswer !== false &&
        (answer === false ||
          Math.abs(xpos - answer) > Math.abs(xpos - tempanswer))
      ) {
        answer = tempanswer
        equation = equation1
      }
    })
    if (answer === false) {
      return false
    }

    const xval = calc.roundFloat(answer)
    const f = calc.makeFunction(equation as string)

    const yval = f(xval)

    // Draw dot
    this.drawDot(xval, yval, color, 4)

    // draw label text
    this.drawLabel(xval, yval, float_fix(xval) + ', ' + float_fix(yval), color)
  }

  drawDerivative(equation: string | undefined, color: string, x: number) {
    if (!equation) {
      return false
    }
    const f = calc.makeFunction(equation)

    const scale = this.getScale()
    const xpos = calc.roundFloat(
      this.arbRound(x / scale.x + this.currCoord.x1, this.xgridscale / 100)
    )

    // Do the actual calculation.
    const slope = Math.round(calc.getDerivative(f, xpos) * 1000000) / 1000000

    let xval = xpos
    let yval = f(xval)
    yval = calc.roundFloat(this.arbRound(yval, 0.0000001))
    const pos = this.getCoord(xval, yval)
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2, false)
    this.ctx.fill()

    // draw derivative lines of exactly 2*xgridscale long
    const xdist = (this.xgridscale * 2) / Math.sqrt(Math.pow(slope, 2) + 1)
    const ydist = xdist * slope
    let linestart = { x: xval - xdist, y: yval - ydist }
    let lineend = { x: xval + xdist, y: yval + ydist }
    this.ctx.beginPath()
    this.ctx.strokeStyle = '#000000'
    linestart = this.getCoord(linestart.x, linestart.y)
    lineend = this.getCoord(lineend.x, lineend.y)
    this.ctx.moveTo(linestart.x, linestart.y)
    this.ctx.lineTo(lineend.x, lineend.y)
    this.ctx.stroke()

    // draw label text
    this.ctx.font = "10pt 'open sans'"
    this.ctx.fillStyle = '#000000'
    const text = 'x=' + xval + ', d/dx=' + slope
    const xval2 = xval // find out whether to put label above or below dot
    xval -= this.xgridscale / 5
    const answer2 = f(xval)
    xval += this.xgridscale / 10
    const answer3 = f(x)
    if (pos.y - 4 < this.charHeight || answer2 > answer3) {
      pos.y += this.charHeight + 3
    }
    const textwidth = this.ctx.measureText(text).width
    if (pos.x - 4 < textwidth) {
      pos.x += textwidth + 3
    }
    this.ctx.fillText(text, pos.x - 4, pos.y - 4)
  }

  // Draws the trace on an equation
  // xpos is the pixel value of x, not the numerical value
  drawTrace(equation: string | undefined, color: string, xval: number) {
    if (!equation) {
      return
    }

    const f = calc.makeFunction(equation)
    const scale = this.getScale()

    xval = float_fix(this.arbRound(xval, this.xgridscale / 100))
    let yval = f(xval) // evaluate the equation
    yval = float_fix(yval)
    const xpos = this.getCoord(xval, yval).x
    const ypos = this.getCoord(xval, yval).y

    this.ctx.strokeStyle = color
    // Draw the lines if the y-value is on the screen
    if (ypos <= this.height && ypos >= 0) {
      // Draw a line from the point to the x-axis
      this.drawLine(xval, yval, xval, 0, '#999')

      // Draw line from point to the y-axis
      this.drawLine(xval, yval, 0, yval, '#999')

      // draw label text
      this.drawLabel(xval, yval, xval + ', ' + yval, '#000000')
    }

    // Draw dot
    this.drawDot(xval, yval, color, 4)

    // Update displayed trace values
    $('input.jsgcalc_trace_input').val(xval)
    $('input.jsgcalc_trace_output').val(yval)
  }

  drawGrid() {
    this.clearScreen()

    const x1 = this.currCoord.x1
    const x2 = this.currCoord.x2
    const y1 = this.currCoord.y1
    const y2 = this.currCoord.y2

    const xrange = x2 - x1
    const yrange = y2 - y1

    // Calculate the numeric value of each pixel (scale of the graph)
    const xscale = Math.max(xrange / this.width, 1e-20)
    const yscale = Math.max(yrange / this.height, 1e-20)

    // Calculate the scale of the gridlines
    let i: number
    let c: number
    for (i = 0.000000000001, c = 0; xrange / i > this.maxgridlines.x - 1; c++) {
      if (c % 3 === 1) {
        i *= 2.5
      }
      // alternating between 2, 5 and 10
      else {
        i *= 2
      }

      // Ensure we don't get into an infinite loop
      if (c > 10000) {
        break
      }
    }
    this.xgridscale = i

    // do the same for the y-axis
    for (i = 0.000000000001, c = 0; yrange / i > this.maxgridlines.y - 1; c++) {
      if (c % 3 == 1) {
        i *= 2.5
      } else {
        i *= 2
      }

      // Ensure we don't get into an infinite loop
      if (c > 10000) {
        break
      }
    }
    this.ygridscale = i

    this.ctx.font = "10pt 'open sans'" // set the font
    this.ctx.textAlign = 'center'

    let xaxis = null
    let yaxis = null

    // currx is the current gridline being drawn, as a numerical value (not a pixel value)
    let currx = this.arbFloor(x1, this.xgridscale) // set it to before the lowest x-value on the screen
    let curry = this.arbFloor(y1, this.ygridscale)
    let xmainaxis = this.charHeight * 1.5 // the next two variables are the axis on which text is going to be placed
    let ymainaxis = -1
    currx = float_fix(currx) // flix floating point errors
    curry = float_fix(curry)

    if (y2 >= 0 && y1 <= 0) {
      // y=0 appears on the screen - move the text to follow
      xmainaxis =
        this.height -
        ((0 - y1) / (y2 - y1)) * this.height +
        this.charHeight * 1.5
    } else if (y1 > 0) {
      // the smallest value of y is below the screen - the x-axis labels get pushed to the bottom of the screen
      xmainaxis = this.height - 5
    }

    // the x-axis labels have to be a certain distance from the bottom of the screen
    if (xmainaxis > this.height - this.charHeight / 2) {
      xmainaxis = this.height - 5
    }

    // do the same as above with the y-axis
    if (x2 >= 0 && x1 <= 0) {
      // y-axis in the middle of the screen
      ymainaxis = ((0 - x1) / (x2 - x1)) * this.width - 2
    } else if (x2 < 0) {
      // y-axis on the right side of the screen
      ymainaxis = this.width - 6
    }

    if (ymainaxis < this.ctx.measureText(curry).width + 1) {
      ymainaxis = -1
    }

    let sigdigs = String(currx).length + 3
    // VERTICAL LINES
    for (i = 0; i < this.maxgridlines.x; i++) {
      let xpos = ((currx - x1) / (x2 - x1)) * this.width // position of the line (in pixels)
      // make sure it is on the screen
      if (xpos - 0.5 > this.width + 1 || xpos < 0) {
        currx += this.xgridscale
        continue
      }

      // currx = Calc.roundToSignificantFigures(currx, sigdigs);
      currx = float_fix(currx)

      if (currx === 0) {
        xaxis = xpos
      }

      if (
        this.jsgui.gridlines === 'normal' ||
        (this.jsgui.gridlines === 'less' &&
          calc.roundFloat(currx) % calc.roundFloat(this.xgridscale * 2) === 0)
      ) {
        this.ctx.fillStyle = 'rgb(190,190,190)'
        this.ctx.fillRect(xpos - 0.5, 0, 1, this.height)
      }
      this.ctx.fillStyle = 'rgb(0,0,0)'

      // Draw label
      if (currx != 0) {
        const xtextwidth = this.ctx.measureText(currx).width
        if (xpos + xtextwidth * 0.5 > this.width) {
          // cannot overflow the screen
          xpos = this.width - xtextwidth * 0.5 + 1
        } else if (xpos - xtextwidth * 0.5 < 0) {
          xpos = xtextwidth * 0.5 + 1
        }
        this.ctx.fillText(currx, xpos, xmainaxis)
      }

      currx += this.xgridscale
    }
    this.ctx.textAlign = 'right'
    sigdigs = String(curry).length + 3

    // HORIZONTAL LINES
    for (i = 0; i < this.maxgridlines.y; i++) {
      let ypos = this.height - ((curry - y1) / (y2 - y1)) * this.height // position of the line (in pixels)
      // make sure it is on the screen
      if (ypos - 0.5 > this.height + 1 || ypos < 0) {
        curry += this.ygridscale
        continue
      }

      // curry = Calc.roundToSignificantFigures(curry, sigdigs);
      curry = float_fix(curry)

      if (curry == 0) {
        yaxis = ypos
      }

      if (
        this.jsgui.gridlines == 'normal' ||
        (this.jsgui.gridlines == 'less' &&
          calc.roundFloat(curry) % calc.roundFloat(this.ygridscale * 2) == 0)
      ) {
        this.ctx.fillStyle = 'rgb(190,190,190)'
        this.ctx.fillRect(0, ypos - 0.5, this.width, 1)
      }
      this.ctx.fillStyle = 'rgb(0,0,0)'

      // Draw label
      if (curry != 0) {
        const ytextwidth = this.ctx.measureText(curry).width
        if (ypos + this.charHeight / 2 > this.height) {
          // cannot overflow the screen
          ypos = this.height - this.charHeight / 2 - 1
        }
        if (ypos - 4 < 0) {
          ypos = 4
        }
        let xaxispos = ymainaxis
        if (ymainaxis == -1) {
          xaxispos = ytextwidth + 1
        }
        this.ctx.fillText(curry, xaxispos, ypos + 3)
      }
      curry += this.ygridscale
    }
    // Draw the axis
    if (xaxis) {
      this.ctx.fillRect(xaxis - 0.5, 0, 1, this.height)
    }
    if (yaxis) {
      this.ctx.fillRect(0, yaxis - 0.5, this.width, 1)
    }
  }

  // get the pixel coordinates of a value
  getCoord(x: number, y: number) {
    const xpos =
      ((x - this.currCoord.x1) / (this.currCoord.x2 - this.currCoord.x1)) *
      this.width
    const ypos =
      this.height -
      ((y - this.currCoord.y1) / (this.currCoord.y2 - this.currCoord.y1)) *
        this.height
    return { x: xpos, y: ypos }
  }

  // get the (numerical) position of a (pixel) coordinate
  getValue(x: number, y: number) {
    const scale = this.getScale()
    const xpos = x / scale.x + this.currCoord.x1
    const ypos = (this.height - y) / scale.y + this.currCoord.y1
    return { x: xpos, y: ypos }
  }

  // zoom to a box. the inputs are pixel coordinates
  doZoomBox(x1: number, y1: number, x2: number, y2: number) {
    if (x1 === x2 || y1 === y2) {
      dump('Invalid doZoomBox')
      return
    }
    const coord1 = this.getValue(x1, y1)
    const coord2 = this.getValue(x2, y2)

    if (x1 > x2) {
      this.currCoord.x1 = coord2.x
      this.currCoord.x2 = coord1.x
    } else {
      this.currCoord.x1 = coord1.x
      this.currCoord.x2 = coord2.x
    }

    if (y2 > y1) {
      this.currCoord.y1 = coord2.y
      this.currCoord.y2 = coord1.y
    } else {
      this.currCoord.y1 = coord1.y
      this.currCoord.y2 = coord2.y
    }

    this.startCoord = this.copyCoord(this.currCoord)
    this.draw()
  }

  draw() {
    this.drawGrid()
    for (const equation of this.lines) {
      // dump(this.lines[i].equation);
      // try {
      this.drawEquation(equation.equation, equation.color, 3)
      /*
			} catch (e) {
        console.warn('Error drawing equation "' +
          this.lines[i].equation + '"', e);
			}     */
    }
    this.jsgui.updateValues()
  }

  // Gets the scale (pixels per unit)
  getScale() {
    return {
      x: this.width / (this.startCoord.x2 - this.startCoord.x1),
      y: this.height / (this.startCoord.y2 - this.startCoord.y1)
    }
  }

  // get the range of values on the screen
  getRange() {
    return {
      x: Math.abs(this.startCoord.x2 - this.startCoord.x1),
      y: Math.abs(this.startCoord.y2 - this.startCoord.y1)
    }
  }

  checkMove(x: number, y: number) {
    if (x === this.prevDrag.x && y === this.prevDrag.y) {
      return
    }

    const scale = this.getScale()
    if (this.mousebutton === 1) {
      if (this.jsgui.currtool === 'zoombox' || this.jsgui.currtool === 'zoombox_active') {
        // ZOOM BOX
        this.draw()
        this.ctx.strokeStyle = 'rgb(150,150,150)'
        this.ctx.strokeRect(
          this.startDrag.x,
          this.startDrag.y,
          x - this.startDrag.x,
          y - this.startDrag.y
        )
      } else {
        // CLICK AND DRAG
        // dump(scale.x + " " + scale.y + " -- " + this.startCoord.x1 + " " + this.startCoord.y1);
        // dump(this.startCoord.x1 + " " +(y - this.startDrag.y) / scale.y);
        this.currCoord.x1 =
          this.startCoord.x1 - (x - this.startDrag.x) / scale.x
        this.currCoord.x2 =
          this.startCoord.x2 - (x - this.startDrag.x) / scale.x

        this.currCoord.y1 =
          this.startCoord.y1 + (y - this.startDrag.y) / scale.y

        this.currCoord.y2 =
          this.startCoord.y2 + (y - this.startDrag.y) / scale.y

        this.draw()
      }
    } else if (this.jsgui.currtool === 'trace') {
      // TRACE
      this.draw()
      this.drawTrace(
        this.getEquation(this.jsgui.currEq),
        this.getColor(this.jsgui.currEq),
        x / scale.x + this.currCoord.x1
      )
    } else if (this.jsgui.currtool === 'vertex') {
      this.draw()
      this.drawVertex(
        this.getEquation(this.jsgui.currEq),
        this.getColor(this.jsgui.currEq),
        x
      )
    } else if (this.jsgui.currtool === 'root') {
      this.draw()
      this.drawRoot(
        this.getEquation(this.jsgui.currEq),
        this.getColor(this.jsgui.currEq),
        x
      )
    } else if (this.jsgui.currtool === 'intersect') {
      this.draw()
      this.drawIntersect(
        this.getEquation(this.jsgui.currEq),
        this.getColor(this.jsgui.currEq),
        x
      )
    } else if (this.jsgui.currtool === 'derivative') {
      this.draw()
      this.drawDerivative(
        this.getEquation(this.jsgui.currEq),
        this.getColor(this.jsgui.currEq),
        x
      )
    }
    this.prevDrag = { x, y }
  }

  mouseDown(event: MouseEvent) {
    document.body.style.cursor = 'hand'
    if (this.mousebutton == 0) {
      if (this.jsgui.currtool === 'zoombox') {
        this.jsgui.currtool = 'zoombox_active'
      }
      this.startDrag.x = event.pageX - this.canvasX
      this.startDrag.y = event.pageY - this.canvasY
      this.startCoord = this.copyCoord(this.currCoord)
    }
    this.mousebutton = 1
  }

  mouseUp(event: MouseEvent) {
    // document.body.style.cursor = "auto";
    if (this.jsgui.currtool === 'zoombox_active') {
      this.doZoomBox(
        this.startDrag.x,
        this.startDrag.y,
        event.pageX - this.canvasX,
        event.pageY - this.canvasY
      )
      this.jsgui.setTool('pointer')
    }
    if (this.jsgui.currtool === 'zoomin') {
      if (
        Math.abs(event.pageX - this.canvasX - this.startDrag.x) +
          Math.abs(event.pageY - this.canvasY - this.startDrag.y) <
        5
      ) {
        this.zoom(0.1, event)
      }
    }
    if (this.jsgui.currtool === 'zoomout') {
      if (
        Math.abs(event.pageX - this.canvasX - this.startDrag.x) +
          Math.abs(event.pageY - this.canvasY - this.startDrag.y) <
        5
      ) {
        this.zoom(-0.1, event)
      }
    }
    this.mousebutton = 0
    this.startCoord = this.copyCoord(this.currCoord)
  }

  mouseWheel(event: MouseEvent, delta: number) {
    if (delta > 0) {
      this.zoom(this.zoomFactor, event)
    } else {
      this.zoom(-this.zoomFactor, event)
    }
  }

  setWindow(x1: number, x2: number, y1: number, y2: number) {
    this.currCoord.x1 = x1
    this.currCoord.x2 = x2
    this.currCoord.y1 = y1
    this.currCoord.y2 = y2
    this.startCoord = this.copyCoord(this.currCoord)
    this.draw()
  }

  zoom(scale: number, event: MouseEvent) {
    const range = this.getRange()
    if (event) {
      const mousex = event.pageX - this.canvasX
      const mousey = event.pageY - this.canvasY
      const mousetop = 1 - mousey / this.height // if we divide the screen into two halves based on the position of the mouse, this is the top half
      const mouseleft = mousex / this.width // as above, but the left hald
      this.currCoord.x1 += range.x * scale * mouseleft
      this.currCoord.y1 += range.y * scale * mousetop
      this.currCoord.x2 -= range.x * scale * (1 - mouseleft)
      this.currCoord.y2 -= range.y * scale * (1 - mousetop)
    } else {
      this.currCoord.x1 += range.x * scale
      this.currCoord.y1 += range.y * scale
      this.currCoord.x2 -= range.x * scale
      this.currCoord.y2 -= range.y * scale
    }
    this.startCoord = this.copyCoord(this.currCoord)
    this.draw()
  }

  animate() {
    this.currCoord.x1 += 0.05
    this.currCoord.y1 += 0.05
    this.currCoord.x2 += 0.05
    this.currCoord.y2 += 0.05
    this.draw()
    setTimeout('jsgcalc.animate()', 50)
  }

  resizeGraph(width: number, height: number) {
    const oldheight = this.height
    const oldwidth = this.width

    // Resize the elements
    $('#graph').width(width)
    $('#graph').height(height)
    this.ctx.height = height
    this.ctx.width = width
    this.graph.height = height
    this.graph.width = width
    this.height = height
    this.width = width
    dump('Resized to ' + width + 'x' + height)

    // Compute the new boundaries of the graph
    this.currCoord.x1 *= width / oldwidth
    this.currCoord.x2 *= width / oldwidth
    this.currCoord.y1 *= height / oldheight
    this.currCoord.y2 *= height / oldheight
    this.startCoord = this.copyCoord(this.currCoord)

    // Compute how many grid lines to show
    this.maxgridlines.x = 0.015 * width
    this.maxgridlines.y = 0.015 * height
    this.draw()
  }

  resetZoom() {
    this.currCoord = {
      x1: -5 * (this.width / this.height),
      y1: -5,
      x2: 5 * (this.width / this.height),
      y2: 5
    }
    this.startCoord = this.copyCoord(this.currCoord)
    this.draw()
  }

  initCanvas() {
    if (this.graph.getContext) {
      this.ctx = this.graph.getContext('2d')
      // this.ctx.height = 953;
      $('#graph_wrapper').width(
        ($('#graph_wrapper').width() || 0) -
          ($('#sidewrapper').innerWidth() || 0) -
          ($('#toolbar').innerWidth() || 0)
      )
      this.resizeGraph(
        ($('#graph_wrapper').innerWidth() || 0),
        ($('#graph_wrapper').height() || 0)
      )
      this.currCoord = {
        x1: -5 * (this.width / this.height),
        y1: -5,
        x2: 5 * (this.width / this.height),
        y2: 5
      }
      this.startCoord = this.copyCoord(this.currCoord)
      this.jsgui.evaluate()

      // this.animate();

      const self = this
      $('#graph')
        .mousemove((event: MouseEvent) => {
          self.canvasX = self.graph.offsetLeft
          self.canvasY = self.graph.offsetTop
          self.checkMove(event.pageX - self.canvasX, event.pageY - self.canvasY)
        })
        .mousedown((event: MouseEvent) => {
          self.mouseDown(event)
        })
        .mousewheel((event: MouseEvent, delta: number) => {
          self.mouseWheel(event, delta)
          return false
        })
        .mouseup((event: MouseEvent) => {
          self.mouseUp(event)
        })

      $(window).resize(function() {
        if ($('#sidewrapper').is(':visible')) {
          $('#graph_wrapper').width(
            ($('#wrapper').width() || 0) -
              ($('#sidewrapper').innerWidth() || 0) -
              ($('#toolbar').innerWidth() || 0)
          )
        } else {
          $('#graph_wrapper').width(
            ($('#wrapper').width() || 0) - ($('#toolbar').innerWidth() || 0)
          )
        }
        self.resizeGraph(
          ($('#graph_wrapper').width() || 0),
          ($('#graph_wrapper').height() || 0)
        )
      })
    } else {
      alert('Sorry, your browser is not supported.')
    }
  }
}

export function about() {
  alert(
    'For demonstration purposes only.\n\nCalculations are not guaranteed to be correct and are often inaccurate due to floating point errors. Use at your own risk.'
  )
}


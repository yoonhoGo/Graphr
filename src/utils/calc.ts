/**
 * This file handles math calculations
 */
import math from 'mathjs'
import _ from 'underscore'
import { dump } from './jsgcalc'

// declare const math: any
// declare const _: any

// Machine epsilon
export function calcEps() {
  let temp1, temp2, mchEps
  temp1 = 1.0
  do {
    mchEps = temp1
    temp1 /= 2
    temp2 = 1.0 + temp1
  } while (temp2 > 1.0)
  return mchEps
}

export class Calc {
  eqcache = new Object()
  angles = 'radians'
  loopcounter = 0
  eps = calcEps() // Machine epsilon - the maximum expected floating point error

  constructor() {
    const replacements: {
      [key: string]: (...args: any[]) => any
    } = {}
    _(['sin', 'cos', 'tan', 'sec', 'cot', 'csc']).each(name => {
      const fn = math[name as 'sin' | 'cos' | 'tan' | 'sec' | 'cot' | 'csc'] // the original function
      replacements[name] = x => {
        return fn(this.convAngles(x))
      }
    })

    _(['asin', 'acos', 'atan', 'atan2']).each(name => {
      const fn = math[name as 'asin' | 'acos' | 'atan' | 'atan2'] // the original function)
      replacements[name] = (x: any, y?: any) => {
        return this.convRadians(fn(x, y))
      }
    })

    // import all replacements into math.js, override existing trigonometric functions
    math.import(replacements, { override: true })
  }

  /* Basic Math Functions (sin, cos, csc, etc.)
   */

  // This will take a number and covert it to radians, based on the current setting
  convAngles(value: number) {
    if (this.angles === 'degrees') {
      return value * (Math.PI / 180)
    }
    if (this.angles === 'gradians') {
      return value * (Math.PI / 200)
    }
    return value
  }

  // This will take a radian value and convert it to the proper unit, based on the current setting
  convRadians(value: number) {
    if (this.angles === 'degrees') {
      return (value * 180) / Math.PI
    }
    if (this.angles === 'gradians') {
      return (value * 200) / Math.PI
    }
    return value
  }

  /* Algorithms
   */

  // Terribly Inaccurate. Ah well.
  getVertex(
    f: (val: number) => any,
    start: number,
    end: number,
    precision: number
  ): number | false {
    this.loopcounter++
    if (Math.abs(end - start) <= precision) {
      this.loopcounter = 0
      return (end + start) / 2
    }
    if (this.loopcounter > 200) {
      this.loopcounter = 0
      return false
    }

    const interval = (end - start) / 40
    let xval = start - interval
    const startanswer = f(xval)
    let prevanswer = startanswer
    for (xval = start; xval <= end; xval += interval) {
      xval = this.roundFloat(xval)
      const answer = f(xval)
      if (
        (prevanswer > startanswer && answer < prevanswer) ||
        (prevanswer < startanswer && answer > prevanswer)
      ) {
        return this.getVertex(f, xval - 2 * interval, xval, precision)
      }
      prevanswer = answer
    }
    this.loopcounter = 0
    return false
  }

  // Uses Newton's method to find the root of the equation. Accurate enough for these purposes.
  getRoot(
    equation: string,
    guess: number,
    range?: number,
    shifted?: boolean
  ): number | false {
    const expr = math.parse(equation)
    const variables = this.variablesInExpression(expr)

    dump(equation + ', guess: ' + guess)
    // Newton's method becomes very inaccurate if the root is too close to zero. Therefore we just whift everything over a few units.
    if (guess > -0.1 && guess < 0.1 && shifted != true) {
      let replacedEquation = equation

      if (variables.length > 0) {
        const v = variables[0]
        replacedEquation = replacedEquation.replace(
          new RegExp('\\b' + v + '\\b', 'g'),
          '(' + v + '+5)'
        )
      }

      dump('Replaced equation = ' + replacedEquation)
      const answer = this.getRoot(replacedEquation, guess - 5, range, true)
      dump(answer)
      if (answer !== false) {
        return answer + 5
      }
      return false
    }

    if (!range) {
      range = 5
    }

    const center = guess
    let prev = guess
    let j = 0

    const code = expr.compile(math)
    const variables2 = this.variablesInExpression(expr)

    const f = (x: number) => {
      const scope: {
        [key: string]: any
      } = {}

      _(variables2).each((name: string) => {
        scope[name] = x
      })

      return code.eval(scope)
    }

    while (prev > center - range && prev < center + range && j < 100) {
      const xval = prev
      const answer = f(xval)

      if (answer > -this.eps && answer < this.eps) {
        return prev
      }

      const derivative = this.getDerivative(f, xval)
      if (!isFinite(derivative)) {
        break
      }

      // dump('d/dx = ' + derivative);
      prev = prev - answer / derivative
      j++
    }

    if (j >= 100) {
      dump('Convergence failed, best root = ' + prev)
      return prev
    }

    dump('false: center at ' + center + ' but guess at ' + prev)

    return false
  }

  // Uses Newton's method for finding the intersection of the two equations. Actually very simple.
  getIntersection(
    equation1: string,
    equation2: string,
    guess: number,
    range: number
  ) {
    // dump("("+equation1 + ") - (" + equation2 + "); guess at "+guess);
    return this.getRoot(
      '(' + equation1 + ') - (' + equation2 + ')',
      guess,
      range
    )
  }

  getDerivative(f: (val: number) => any, xval: number) {
    /*
     * This is a brute force method of calculating derivatives, using
     * Newton's difference quotient (except without a limit)
     *
     * The derivative of a function f and point x can be approximated by
     * taking the slope of the secant from x to x+h, provided that h is sufficently
     * small. However, if h is too small, then floating point errors may result.
     *
     * This algorithm is an effective 100-point stencil in one dimension for
     * calculating the derivative of any real function y=equation.
     */
    let ddx = 0

    // The suitable value for h is given at http://www.nrbook.com/a/bookcpdf/c5-7.pdf to be sqrt(eps) * x
    const x = xval
    let h = 0
    if (x > 1 || x < -1) {
      h = Math.sqrt(this.eps) * x
    } else {
      h = Math.sqrt(this.eps)
    }

    const answerx = f(x)
    for (let i = 1; i <= 50; i++) {
      const diff = h * i
      const inverseDiff = 1 / diff

      // h is positive
      xval = x + diff
      let answer = f(xval)
      ddx += (answer - answerx) * inverseDiff

      // h is negative
      xval = x - diff
      answer = f(xval)
      ddx += (answerx - answer) * inverseDiff
    }

    return ddx / 100
  }

  /* Utility functions
   */
  variablesInExpression(expr: any) {
    const obj: {
      [key: string]: boolean
    } = {}

    expr.traverse((node: any) => {
      if (node.type === 'SymbolNode' && math[node.name] === undefined) {
        obj[node.name] = true
      }
    })

    return Object.keys(obj).sort()
  }

  makeFunction(equation: string) {
    const expr = math.parse(equation)
    const code = expr.compile(math)
    const variables = this.variablesInExpression(expr)

    return <T>(x: T) => {
      const scope: {
        [key: string]: T
      } = {}

      _(variables).each((name: string) => {
        scope[name] = x
      })

      return code.eval(scope)
    }
  }

  roundToSignificantFigures(num: number, n: number) {
    if (num === 0) {
      return 0
    }

    const d = Math.ceil(math.log10(num < 0 ? -num : num))
    const power = n - d

    const magnitude = Math.pow(10, power)
    const shifted = Math.round(num * magnitude)
    return shifted / magnitude
  }

  roundFloat(val: number) {
    // Stupid flaoting point inprecision...
    return Math.round(val * 100000000000) / 100000000000
  }
}

export const calc = new Calc()

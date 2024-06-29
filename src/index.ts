import ejs from 'ejs'
import { parse } from "xtp-bindgen"

function getContext() {
  const ctx = JSON.parse(Config.get('ctx'))
  ctx.schema = parse(JSON.stringify(ctx.schema))
  return ctx
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ctx: getContext()
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}

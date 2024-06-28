import ejs from 'ejs'

function getContext() {
  return JSON.parse(Config.get('ctx'))
}

// TODO we'll include a bunch of helper functions or methods
// in a separate package. 
function isJson(func) {
  return func.contentType === 'application/json'
}

export function render() {
  const tmpl = Host.inputString()
  const ctx = {
    ctx: getContext(),
    isJson,
  }
  const output = ejs.render(tmpl, ctx)
  Host.outputString(output)
}

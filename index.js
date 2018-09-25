const fs = require('fs')
const svg = require('svg2ttf/lib/svg')
const svg2ttf = require('svg2ttf')

const defaultOptions = {
  compress: true,
  prefix: 'icon',
  fontFamily: 'icons',
}

module.exports = function(options) {
  if (typeof options === 'string') {
    options = { source: options, ...defaultOptions }
  } else {
    options = Object.assign({}, options, defaultOptions)
  }

  let source
  if (typeof options.source === 'string') {
    source = options.source
  } else {
    try {
      source = fs.readFileSync(options.srcFile).toString()
    } catch (error) {
      throw new Error('No source text or source file was found.')
    }
  }

  const base64 = Buffer.from(svg2ttf(source).buffer).toString('base64')

  let result
  if (options.compress) {
    result = `\
@font-face{font-family:'${options.fontFamily}';\
src:url(data:font/ttf;base64,${base64})format('truetype');\
font-weight:normal;font-style:normal;}\
i[class^="${options.prefix}-"],i[class*=" ${options.prefix}-"]{\
font-family:'${options.fontFamily}'!important;\
font-style:normal;font-weight:normal;\
font-variant:normal;text-transform:none;\
line-height:1;-webkit-font-smoothing:antialiased;}` + 
    svg.load(source).glyphs.map((glyph) => {
      if (!glyph.name) return ''
      return `.icon-${glyph.name}:before{content:"\\${
        glyph.unicode[0].toString(16).padStart(4, '0')
      }"}`}).join('')
  } else {
    result = `\
@font-face {
  font-family: '${options.fontFamily}';
  src: url(data: font/ttf;base64,${base64}) format('truetype');
  font-weight: normal;
  font-style: normal;
}\n
i[class^="${options.prefix}-"], i[class*=" ${options.prefix}-"] {
  font-family: '${options.fontFamily}' !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}\n` + 
    svg.load(source).glyphs.map((glyph) => {
      if (!glyph.name) return ''
      return `.${options.prefix}-${glyph.name}:before { content: "\\${
        glyph.unicode[0].toString(16).padStart(4, '0')
      }" }`}).join('\n')
  }

  if (options.outFile) {
    fs.writeFileSync(options.outFile, result)
  }

  return result
}

module.exports.default = module.exports

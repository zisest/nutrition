const fs = require('fs')
const path = require('path')
const readline = require('readline')

let componentName = '' 
let createStory = false

const componentFile = (kebab, camel) => {
  return `import React from 'react'
import './${kebab}.css'
  
function ${camel}() {
  return (
    <div className='${kebab}'>
      ${kebab}
    </div>
  )
}
${camel}.defaultProps = { }
  
export default ${camel}
`
}
const indexFile = (kebab, camel) => {
  return `import ${camel} from './${kebab}'

export default ${camel}`
}
const storyFile = (kebab, camel) => {
  return `import React from 'react'
import ${camel} from '../src/components/${kebab}'

export default { 
  title: '${camel}',
  component: ${camel}
}

export const ${camel}Story = () => <${camel} />`
}

const kebabToCapitalCamel = kebab =>
  kebab.toLowerCase().split('-').map(val => val.charAt(0).toUpperCase() + val.slice(1)).join('')


const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

prompt.question('Component name (kebab-case): ', name => {
  prompt.question('Create story? [y/n]: ', ans => {
    componentName = name
    if (ans === 'y') createStory = true
    prompt.close()  
  })
})

prompt.on("close", function() {
  if (componentName !== '') {
    const capitalCamel = kebabToCapitalCamel(componentName)
    fs.mkdirSync('./src/components/' + componentName, { recursive: true })
    fs.writeFileSync(`./src/components/${componentName}/${componentName}.js`, componentFile(componentName, capitalCamel))
    fs.writeFileSync(`./src/components/${componentName}/index.js`, indexFile(componentName, capitalCamel))
    fs.writeFileSync(`./src/components/${componentName}/${componentName}.css`, '')
    if (createStory) {
      fs.writeFileSync(`./stories/${componentName}.story.js`, storyFile(componentName, capitalCamel))
    }
  } else process.exit(1)
  process.exit(0)  
})


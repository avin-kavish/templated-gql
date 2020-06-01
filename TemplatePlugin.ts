import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base'
import { compile } from 'handlebars'
import { join as joinPath } from 'path'
import fs = require('fs')
const { readFile, readdir } = fs.promises

export class TemplatePlugin implements ApolloServerPlugin {
  templates: Record<string, { template: HandlebarsTemplateDelegate }> = {}

  constructor({ path = 'templates' } = {}) {
    this.init({ path })
  }

  private async init({ path }) {
    const templates = await this.compileTemplates(path)
    this.templates = templates
  }

  private async compileTemplates(path) {
    const absDir = joinPath(__dirname, path)
    const files = await readdir(absDir)

    const templateArray = await Promise.all(
      files.map(fileName => 
        readFile(joinPath(absDir, fileName), "utf-8")
          .then(contents => ({ name: fileName.replace('.hbs', ''), template: compile(contents)}))
      )
    )

    return templateArray.reduce((acc, t) => { 
      acc[t.name] = { template: t.template}
      return acc
    }, {})
  }

  requestDidStart(): GraphQLRequestListener {
    const self = this

    return {

      willSendResponse({ request, response, document }) {
        // need to traverse AST in document and determine which template to apply
        // or user could send a parameter for that

        response.extensions = {
          html: self.templates['hello'].template({ data: response.data['hello'] })
        }
      }
    }
  }
}

import { ApolloServer, gql } from 'apollo-server-express'
import { TemplatePlugin } from './TemplatePlugin'
import * as express from 'express'

const typeDefs = gql`
  type Query {
    hello: Name
  }

  type Name {
    firstName: String
    lastName: String
  }
`

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      hello: () => ({ firstName: 'John', lastName: 'Doe' })
    }
  },
  plugins: [
    new TemplatePlugin
   ]
})

const app = express()

server.applyMiddleware({ app });

app.listen({ port: 4010 }, () =>
  console.log(`🚀 Server ready at http://localhost:4010${server.graphqlPath}`)
)

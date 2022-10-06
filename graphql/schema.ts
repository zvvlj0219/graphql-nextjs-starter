import { addResolversToSchema } from '@graphql-tools/schema'
import { typeDefs } from './typeDefs'
import resolvers from './resolvers'

export const schemaWithResolvers = addResolversToSchema({ schema: typeDefs, resolvers });

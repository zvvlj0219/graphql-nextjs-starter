import path from 'path'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';

export const typeDefs = loadSchemaSync(path.join(process.cwd(), 'graphql/typeDefs/**/*.graphql'), {
    loaders: [new GraphQLFileLoader()],
});

console.log(typeDefs.getRootType)
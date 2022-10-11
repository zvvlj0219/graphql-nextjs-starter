import path from 'path'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers } from '@graphql-tools/merge'

// import resolvers
import bookResolvers from './book.resolvers'
import phoneResolvers from './phone.resolvers'
import todoResolvers from './todo.resolvers'

const resolvers = [
    bookResolvers,
    phoneResolvers,
    todoResolvers
]
export default mergeResolvers(resolvers)


// const resolversArray = loadFilesSync(
//     path.join(__dirname, './book.resolvers.ts'),
// )
// console.log(path.join(__dirname, './**/*.resolvers.*'))
// console.log(resolversArray)
// export default mergeResolvers(resolversArray)

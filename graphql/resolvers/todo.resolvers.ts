import TodoSchema from '../../models/Todo'
import db from '../../utils/db'
import type { Todo } from '../../@types/todo'
import type {
    MutationResolvers,
    QueryResolvers,
    MutationDeleteTodoArgs,
    MutationEditTodoArgs,
    ResolversTypes
} from '../generated/resolvers'

const Query: QueryResolvers = {
    getTodos: async () => {
        const todoDocuments = await TodoSchema.find().lean()
    
        const todoList = todoDocuments ? todoDocuments.map((doc: Todo) => {
            return db.convertDocToObj(doc)
        }) : []

        return todoList
    }
}

const Mutation: MutationResolvers = {
    addTodo: async (parent, args, context, info) => {
        const newTodo = new TodoSchema({
            todo: args.newTodo
        })

        return newTodo.save()
    },

    editTodo: async (parent, args, context, info) => {

        const todoDocument = await TodoSchema.findByIdAndUpdate(
            args._id,
            {
                $set: {
                    todo: args.newTodo
                }
            },
            {
                returnDocument: 'after'
            }
        )

        const updatedTodo = todoDocument 
        ? db.convertDocToObj(todoDocument)
        : {}

        return updatedTodo as Todo
    },

    deleteTodo:async (parent, args, context, info) => {
        const todoDocument = await TodoSchema.findByIdAndDelete({
            _id: args._id
        })

        const deletedTodo = todoDocument 
        ? db.convertDocToObj(todoDocument)
        : {}

        return deletedTodo
    }
}

export default {
    Query,
    Mutation
}
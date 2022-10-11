import TodoSchema from '../models/Todo'
import db from '../utils/db'
import type { Todo } from '../@types/todo'
import Layout from '../components/Layout'

type Props = {
    todoList: Todo[]
}

const TodoList = ({ todoList }: Props) => {
    console.log(todoList)
    return (
        <Layout>
            <div>
                getStaticPropsで取得したtodo
                {
                    todoList.map(doc => (
                        <ul key={doc._id}>
                            <li>{ doc.todo }</li>
                        </ul>
                    ))
                }
            </div>
        </Layout>
    )
}

export default TodoList

export const getStaticProps = async () => {
    await db.connect()

    const todoDocuments = await TodoSchema.find().lean()

    await db.disconnect()

    const todoList = todoDocuments ? todoDocuments.map((doc: Todo) => {
        return db.convertDocToObj(doc)
    }) : []

    return {
        props: {
            todoList
        }
    }
}
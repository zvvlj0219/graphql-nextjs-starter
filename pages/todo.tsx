import TodoSchema from '../models/Todo'
import db from '../utils/db'
import type { Todo } from '../@types/todo'
import Layout from '../components/Layout'
import Button from '../components/Button'
import TodoFrom from '../components/TodoForm'
import styles from '../styles/todo.module.css'
import { useGetTodosQuery, useAddTodoMutation, GetTodosDocument } from '../graphql/generated/generated'
import { useEffect, useState } from 'react'

type Props = {
    todoList: Todo[]
}

const TodoList = ({ todoList }: Props) => {
    const [todoList_graphql, setTodoList] = useState<Todo[]>(todoList)

    const [newTodo, setNewTodo] = useState<string>('')

    const { data } = useGetTodosQuery()

    const [addTodoMutation] = useAddTodoMutation()

    const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTodo((event.target as HTMLInputElement).value)
    }

    const addTodoHandler = () => {
        addTodoMutation({
            variables: {
                newTodo
            },
            update: async (cache, result) => {
                const { data } = result

                if(!data) return

                const { getTodos: cachedTodos } = await cache.readQuery({
                    query: GetTodosDocument
                }) as { getTodos: Todo[] }

                console.log(data)
                console.log(cachedTodos)

                cache.writeQuery({
                    query: GetTodosDocument,
                    data: {
                        getTodos: [
                            ...cachedTodos, data.addTodo
                        ]
                    }
                })
            }
        })

        setNewTodo('')
    }

    useEffect(() => {
        if(data) {
            setTodoList(data.getTodos as Todo[])
        }
    }, [data])

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
                <hr />
                <div>
                    <p>getStaticPropsのTodoをgrapqhqlのquery,mutationで変更</p>
                    <div className={styles.textfield_container}>
                        <input
                            type='text'
                            placeholder='...'
                            className={styles.textfeild}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                onChangeHandler(e)
                            }}
                            value={newTodo}
                        />
                        <Button
                            className={styles.add_button}
                            onClick={() => addTodoHandler()}
                        >
                            add
                        </Button>
                    </div>
                    {
                        
                        
                        todoList_graphql.map(doc => (
                            <div  className={styles.todo_container} key={doc._id}>
                                <TodoFrom _id={doc._id} todo={doc.todo} />
                            </div>
                        ))
                        
                    }
                </div>
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
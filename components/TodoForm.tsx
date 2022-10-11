import React, { useState, useCallback, useRef } from 'react'
import Button from './Button'
import type { Todo } from '../@types/todo'
import styles from '../styles/todo.module.css'
import {
    useEditTodoMutation,
    useDeleteTodoMutation,
    GetTodosDocument
} from '../graphql/generated/generated'

const TodoForm = ({ _id, todo = '' }: Todo) => {
    const inputElement = useRef<HTMLInputElement>(null)

    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [isDelete, setIsDelte] = useState<boolean>(true)
    const [textField, setTextFeild] = useState<string>(todo)

    const [editTodoMutation] = useEditTodoMutation()
    const [deleteTodoMutaion] = useDeleteTodoMutation()

    const onFocusHandler = (cond: 'focus' | 'blur') => {
        if (cond === 'focus') {
            setIsEdit(true)
            setIsDelte(false)
        }

        if (cond === 'blur' && inputElement.current !== null) {
            setIsEdit(false)
            setIsDelte(true)
            // call editTodoHandler
            inputElement.current.blur()
        }
    }

    const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTextFeild((event.target as HTMLInputElement).value)
    }

    const onKeyPressHandler = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === 'Enter') {
            onFocusHandler('blur')
        }
    }

    const editTodoHandler = async (_newtodo: string) => {
        if (_newtodo === todo) return onFocusHandler('blur')

        editTodoMutation({
            variables: {
                _id,
                newTodo: _newtodo
            },
            update: async (cache, result) => {
                const { data } = result

                if(!data) return

                const { getTodos: cachedTodos } = await cache.readQuery({
                    query: GetTodosDocument
                }) as { getTodos: Todo[] }

                cache.writeQuery({
                    query: GetTodosDocument,
                    data: {
                        getTodos: cachedTodos
                    }
                })
            }
        })

        onFocusHandler('blur')

    }

    const deleteTodoHandler = async () => {
        deleteTodoMutaion({
            variables: {
                _id
            },
            update: async (cache, result) => {
                const { data } = result

                if(!data) return

                const { getTodos: cachedTodos } = await cache.readQuery({
                    query: GetTodosDocument
                }) as { getTodos: Todo[] }

                console.log(cachedTodos)

                const updatedTodos = cachedTodos.filter(todo => {
                    return todo._id !== data.deleteTodo._id
                })

                console.log(updatedTodos)

                cache.writeQuery({
                    query: GetTodosDocument,
                    data: {
                        getTodos: updatedTodos
                    }
                })
            }

        })

    }

    return (
        <>
            <input
                type='text'
                ref={inputElement}
                value={textField}
                className={styles.todo_input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onChangeHandler(e)
                }}
                onFocus={() => onFocusHandler('focus')}
                onBlur={() => {
                    editTodoHandler(textField)
                }}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    onKeyPressHandler(e)
                }}
            />
            <div className={styles.todo_button_wrapper}>
                <Button
                    className={`
                        ${isEdit && styles.edit_button_active}
                        ${styles.edit_button}
                    `}
                    // click to call editTodoHandler
                    onClick={() => onFocusHandler('blur')}
                >
                    edit
                </Button>
                <Button
                    className={`
                    ${isDelete && styles.delete_button_active}
                    ${styles.delete_button}
                    `}
                    onClick={() => deleteTodoHandler()}
                >
                    delete
                </Button>
            </div>
        </>
    )
}

export default TodoForm
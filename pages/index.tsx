import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useBooksQuery} from '../graphql/generated/generated'
import ImageList from '../components/ImageList'
import db from '../utils/db'
import TodoList from './todo'
import Layout from '../components/Layout'
import { useHelloSWR } from '../utils/hooks/useHelloSWR'

const Home: NextPage = () => {
    const  { data: books} = useBooksQuery()
    console.log(books)

    const { data } = useHelloSWR()
    console.log(data)
    return (
        <Layout>
            { data && data.name }
        </Layout>
    )
}


export default Home

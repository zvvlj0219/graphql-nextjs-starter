import { useEffect, useRef, useState } from 'react'
import styles from '../styles/image.module.css'
import db from '../utils/db'

interface FetchOption {
    method: string
    headers?: {
        [key: string ]: string
    },
    body: FormData
}

type BucketFile = {
    chunkSize: number
    contentType: string
    filename: string
    length: number
    uploadDate: string
    _id: string
}

interface Image {
    id: string
    file: File
}

interface Preview {
    id: string
    url: FileReader['result'] | undefined
}

interface Post {
    id: string
    url: string
}

const uri = `http://localhost:3000/api`

const ImageList = () => {
    const fileInputElement = useRef<HTMLInputElement>(null)
    const [bucketFile, setBucketFile] = useState<BucketFile[] | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [selectedfiles, setSelectedFiles] = useState<Image[] | null>(null)
    const [previewSrc, setPreviewSrc] = useState<Preview[]>([])
    const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false)

    const selectImageHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        setIsPreviewActive(true)

        if (fileInputElement.current === null) return 
        const FileObject = fileInputElement.current.files as FileList

        const FileArray = Object.keys(FileObject).map((key: string) => {
            const file = FileObject[Number(key)]

            return {
                id: file.name,
                file
            }
        })

        setSelectedFiles(FileArray)

        // call preview
        for (let i = 0; i < FileObject.length; i+= 1) {
            // previewSelectedImage(FileArray[i])
            previewSelectedImage(FileArray[i])
        }
    }

    const previewSelectedImage = (img: Image) => {
        if (!img && !isPreviewActive) return

        const reader = new FileReader()
    
        reader.readAsDataURL(img.file)
    
        reader.onload = event => {
            
            setPreviewSrc(previewSrc => {
                return [
                    ...previewSrc,
                    {
                        id: event.target?.result as string,
                        url: event.target?.result
                    }
                ]
            })
        }
    }
    
    const removePreviewImage = (id: string) => {
        const updatedPreviewSrc = previewSrc.filter(preview => {
            return preview.id !== id
        })

        if (updatedPreviewSrc.length === 0) {
            setIsPreviewActive(false)
        }

        setPreviewSrc(updatedPreviewSrc)
    }

    const uploadImageToGridFs = async () => {
        if(!selectedfiles) return

        try {
            const formData = new FormData()
            selectedfiles.forEach((img: Image) => {
                formData.append('upload-image-name', img.file)
            })
    
            const options: FetchOption = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData
            }
    
            // fetchでバイナリデータを送信する際
            // boundaryを正常に設定させるために
            // Content-Typeを削除する
            if(typeof options.headers === 'undefined') return
            delete options.headers['Content-Type']
    
            const res = await fetch(`${uri}/images/upload`, options)
            const { files } = await res.json() as { files: File[] }

            if(files) {
                setIsPreviewActive(false)
                // refetch
                console.log(...files)
                files.forEach(file => {
                    fetchImageBinaryDataFromGridfs(file.name)
                })
            }
        } catch (error) {
            throw new Error('something wrong')
        }
    }

    const deleteImageFromGridFs = async (id: string) => {
        const res = await fetch(`${uri}/images/delete/${id}`,{
            method: 'DELETE'
        })

        console.log(res)

        if(res) {
            const updatedPosts = posts.filter(post => {
                return post.id !== id
            })
            setPosts(updatedPosts)
        }
    }

    const fetchImagesFileFromGridFs = async () => {
        const res = await fetch(`${uri}/images`)
        const { result } = await res.json()
        setBucketFile(result)
    }

    const fetchImageBinaryDataFromGridfs = async (filename: string) => {
        const postData = await fetch(`${uri}/images/fetch/${filename}`)
        console.log(postData)
        setPosts(prevPosts => ([
            ...prevPosts,
            {
                id: filename,
                url: postData.url
            }
        ]))
    }

    useEffect(() => {
        if(bucketFile){
            bucketFile.forEach((file:BucketFile) => {
                fetchImageBinaryDataFromGridfs(file.filename)
            })
        } else {
            fetchImagesFileFromGridFs()
        }
    }, [bucketFile])

    return (
        <div>
            <h2 className={styles.heading}>-Upload Image to mongodb Gridfs-</h2>
            <div className='upload_image_form_container'>
                <div className={`${styles.flex_container_column}`}>
                    <form
                        className='select_image'
                        encType='multipart/form-data'
                    >
                        {
                            !isPreviewActive 
                            && (
                                <label
                                    htmlFor='upload-image-id'
                                    className={styles.select_image_label}
                                >
                                    select images
                                    <input
                                        type='file'
                                        accept='image/*'
                                        name='upload-image-name'
                                        id='upload-image-id'
                                        multiple
                                        className={styles.display_none}
                                        ref={fileInputElement}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => selectImageHandler(event)}
                                    />
                                </label>
                            )
                        }  
                        {
                            previewSrc.length !== 0
                            && isPreviewActive
                            && (
                                <div className='preview_image_container'>
                                    <p>preview</p>
                                    {
                                        previewSrc.map(preview => (
                                            preview.url === null ||
                                            typeof preview.url === 'undefined' ? (
                                                <div key={preview.id} className='preview_image_lists'>
                                                    <div className={styles.image_wrapper}>
                                                        <img src={String(preview.url)} alt='' className={styles.image} />
                                                        <div className={styles.preview_button_container}>
                                                            <button
                                                                type='button'
                                                                onClick={() => removePreviewImage(preview.id)}
                                                                className={styles.cancel_button}
                                                            >
                                                                cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div  className={styles.image_wrapper}>
                                                    <p>faild to preview image</p>
                                                </div>
                                            )
                                        ))
                                    }
                                    <div className={`${styles.flex_container_row}  ${styles.justify_content_flexEnd}`}>
                                        <div className={styles.preview_button_container}>
                                            <button
                                                type='button'
                                                onClick={() => setIsPreviewActive(false)}
                                                className={styles.cancel_all_button}
                                            >
                                                cancel
                                            </button>
                                        </div>
                                        <div className={styles.preview_button_container}>
                                            <button
                                                type='button'
                                                onClick={() => uploadImageToGridFs()}
                                                className={styles.upload_button}
                                            >
                                                upload
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </form>
                </div>
            </div>
            <div className='user_posts'>
                <div className={styles.flex_container_column}>
                    <p>posts</p>
                    {
                        posts.length !== 0 && posts.map(post => (
                            <div className={styles.image_wrapper} key={post.id ?? 'unique_key'}>
                                <img src={post.url} alt='' className={styles.image} />
                                <button
                                    type='button'
                                    onClick={() => deleteImageFromGridFs(post.id)}
                                    className={styles.delete_button}
                                >
                                    delete
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

// export const getServerSideProps = async () => {
//     await db.connect()
//     await db.disconnect()

//     return {
//         props: {
//             sample: ''
//         }
//     }
// }


export default ImageList

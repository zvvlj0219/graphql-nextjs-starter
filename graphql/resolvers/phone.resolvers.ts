const phones = [
    {
        type: 'andriod'
    },
    {
        type: 'iphone'
    }
]

const Query = {
    phones: () => phones
}

// Queryのクエリ名はスキーマの方のQueryのクエリ名と一致していないとダメ

export default {
    Query
}
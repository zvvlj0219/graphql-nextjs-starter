/**
 * @description
 * useSWR のパラメータなどで使用する。
 * @param {string} [url] API URL
 * @returns  API レスポンス
 */
export const fetcher = async (url: string) => {
    const res = await fetch(url)
    const data = await res.json()
    return data
}
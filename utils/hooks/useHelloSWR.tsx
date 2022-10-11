import useSWR, { SWRResponse } from 'swr'
import { Todo } from "../../@types/todo";
import { fetcher } from "../../lib/fetcher";

export const useHelloSWR = (
    fallbackData?: { name: string }
):SWRResponse<{ name: string }> => {
    return useSWR('api/hello', fetcher, { fallbackData })
    // return useSWR('api/graphql', fetcher, { fallbackData })
}
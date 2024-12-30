import {z} from "zod"

export const postObject = z.object({
    session_id: z.string(),
    body: z.string()
})
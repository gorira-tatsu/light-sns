import { password } from "bun"
import {z} from "zod"

export const loginAuthrizationInfomation = z.object({
    user_id: z.string(
        {
            required_error: "missing user_id",
        }
    ),
    password: z.string(
        {
            required_error: "missing password"
        }
    )
})

export const signupAuthrizationInfomation = z.object({
    user_id: z.string(),
    password: z.string()
})
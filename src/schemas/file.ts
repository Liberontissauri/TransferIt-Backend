import { z } from "zod"

export const User_File = z.object({
    id: z.string().uuid(),
    user: z.string().uuid(),
    file_name: z.string(),
    file_description: z.string(),
    created_at: z.date(),
    updated_at: z.date()
})

export type User_File = z.infer<typeof User_File>

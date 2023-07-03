import { z } from "zod"

export const User = z.object({
    id: z.string().uuid(),
    username: z.string().max(20),
    hash: z.string(),
    email: z.string().email(),
    storage_limit: z.coerce.number().transform(storage_limit => Number(storage_limit)),
    used_storage: z.number().transform(storage_limit => Number(storage_limit)),
    created_at: z.date(),
    updated_at: z.date()
})

export type User = z.infer<typeof User>

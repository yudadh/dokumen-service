import { z } from "zod"

export const fileMetadataSchema = z.object({
    originalname: z.string().min(1, "File name is required"),
    mimetype: z.enum(["image/jpeg", "image/png", "application/pdf"]).optional(),
    size: z.number().max(5 * 1024 * 1024, "File size must not exceed 5 MB"), // Max 5 MB
});

export const requestDokumenSchema = z.object({
    siswa_id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
    dokumen_id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
})

export const uploadDokumenQuerySchema = z.object({
    dokumen_jenis: z.string().min(1).regex(/^[a-zA-Z0-9\s/]+$/, "input only accepts letters, numbers, space and characters /").transform((value) => value.replace(/[\/\s]/g, "-")),
    // keterangan: z.nullable(z.string())
})

export const requestDokumenParams = z.object({
    siswa_id: z.string().regex(/^\d+$/, "ID must be a numeric string") 
})

export const requestDokumenUpdate = z.object({
    status: z.enum(["BELUM_VALID", "VALID_SD", "VALID_SMP"]),
    keterangan: z.string().nullable()
})

export const requestDokumenUpdateParams = z.object({
    dokumen_siswa_id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
})

export const requestCreateMasterDokumenBodySchema = z.object({
    dokumen_jenis: z.string().min(1).regex(/^[a-zA-Z0-9/ ]+$/, "input only accepts letters, numbers and characters /"),
    is_umum: z.boolean(),
    keterangan: z.string().nullable()
})

export const createDokumenJalurBodySchema = z.object({
    jalur_id: z.number().int().positive(),
    dokumen_id: z.number().int().positive()
})

export const dokumenParamsSchema = z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string") 
})
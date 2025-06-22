import { NextFunction, Request, RequestHandler, Response } from "express"
import { DokumenRepository } from "../repositories/dokumenRepository"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import { number } from "zod"


export const verifyPeriodeJalurJadwal = (tahapan: string): RequestHandler =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const now = new Date()
            const periodeActive = await DokumenRepository.findPeriodeActive(now)
        
            if (!periodeActive) {
                throw new AppError("Tidak ada periode yang sedang berlangsung", 404)
            }
        
            const periodeJalur = periodeActive.periodejalur
        
            if (!periodeJalur.length) {
                throw new AppError("Tidak ada periode jalur yang sedang berlangsung", 404)
            }
        
            const jadwals = periodeJalur[0].jadwals
            const jadwalActive = jadwals.find((j) => j.tahapan.tahapan_nama.toLowerCase() === tahapan && j.is_closed !== 1)
            if (!jadwalActive) {
                throw new AppError(`Tidak ada data jadwal ${tahapan} pada database`, 404)
            }
        
            if (!jadwalActive.waktu_mulai || !jadwalActive.waktu_selesai) {
                throw new AppError(`Tidak ada data waktu mulai dan waktu selesai pada jadwal ${jadwalActive.tahapan.tahapan_nama}`, 404)
            }
        
            if (jadwalActive.waktu_mulai > now || jadwalActive.waktu_selesai < now) {
                throw new AppError(`Tidak ada jadwal ${jadwalActive.tahapan.tahapan_nama} yang sedang berlangsung`, 404)
            }

            req.body.periode_jalur = periodeJalur[0].periode_jalur_id
            next()
        } catch (error) {
            logger.error(`error at verifyPeriodeJalurJadwal middleware`)
            next(error)
        }

    }   
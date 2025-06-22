import { logger } from "../utils/logger";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const upload = multer({
   storage: multer.memoryStorage(), // Simpan file sementara di memory
   limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
   },
   fileFilter: (req, file, cb) => {
      logger.info(req.file);
      logger.info(file.mimetype);
      logger.info(file.originalname);
      const allowedMimes = [
         "image/jpeg",
         "image/png",
         "image/jpg",
         "application/pdf",
      ];
      if (allowedMimes.includes(file.mimetype)) {
         logger.info(file.size);
         cb(null, true);
      } else {
         logger.warn(
            "Tipe file tidak didukung. Hanya JPG, JPEG, PNG, dan PDF yang diperbolehkan"
         );
         cb(
            new AppError(
               "Tipe file tidak didukung. Hanya JPG, JPEG, PNG, dan PDF yang diperbolehkan",
               400
            )
         );
      }
   },
});

export const multerErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
       logger.error(`Multer error: ${err.message}`);
       // Cek apakah error berasal dari multer
       if (err.message.includes("File too large")) {
          return res.status(400).json({
             error: "Ukuran file terlalu besar. Maksimum ukuran file adalah 5MB.",
          });
       }
       if (err.message.includes("Tipe file tidak didukung")) {
          return res.status(400).json({
             error: "Tipe file tidak didukung. Hanya JPG, JPEG, PNG, dan PDF yang diperbolehkan.",
          });
       }
       return res.status(500).json({
          error: "Terjadi kesalahan saat mengunggah file.",
       });
    }
    next(); // Lanjutkan ke middleware berikutnya jika tidak ada error
 };
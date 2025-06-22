import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { DokumenService } from "../services/dokumenService";
import { successResponse } from "../utils/successResponse";
import {
   DokumenRequest,
   DokumenResponse,
   UpdateDokumenStatus,
   DokumenSiswaResponse,
   DokumenMasterDTO,
   Role,
} from "../interfaces/dokumenInterface";
import { logger } from "../utils/logger";
import { StatusDokumen } from "@prisma/client";

export async function uploadDocument(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { siswa_id, dokumen_id } = req.params;
      const { dokumen_jenis } = req.query;
      const user_role = req.user ? req.user.role : 'siswa'
      const response = await DokumenService.handleFileUpload(
         req.file as Express.Multer.File,
         Number(siswa_id),
         Number(dokumen_id),
         String(dokumen_jenis),
         user_role
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in handleFileUpload]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in handleFileUpload]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in uploading file]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getDocumentBySiswaId(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const userRole = req.user ? req.user.role : 'adminDisdik'
      const { siswa_id } = req.params;
      const response: { response: DokumenSiswaResponse[], nama: string } =
         await DokumenService.getDocumentBySiswaId(
            parseInt(siswa_id),
            userRole as Role
         );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getDocumentBySiswaId]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getDocumentBySiswaId]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getDocumentBySiswaId]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function updateDocumentStatus(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const userRole = req.user ? req.user.role : 'adminDisdik' 
      const { dokumen_siswa_id } = req.params;
      const requestBody: { 
         status: StatusDokumen, 
         keterangan: string | null,
         periode_jalur_id: number  
      } = req.body;
      console.log(requestBody.keterangan)
      const response: UpdateDokumenStatus =
         await DokumenService.updateDocumentStatus(
            Number(dokumen_siswa_id as string),
            requestBody.status,
            requestBody.keterangan,
            userRole as Role,
            requestBody.periode_jalur_id
         );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in updateDocumentStatus]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in updateDocumentStatus]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in updateDocumentStatus]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function deleteSiswaDocument(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { dokumen_siswa_id } = req.params;
      const response = await DokumenService.deleteSiswaDocument(
         Number(dokumen_siswa_id as string)
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in deleteSiswaDocument]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in deleteSiswaDocument]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in deleteSiswaDocument]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function createMasterDocument(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const request: DokumenMasterDTO =
         req.body;
      const response = await DokumenService.createMasterDocument(
         request.dokumen_jenis,
         request.is_umum,
         request.keterangan
      );
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createMasterDocument]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in createMasterDocument]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in createMasterDocument]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function updateMasterDocumentById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params;
      const {
         dokumen_nama,
         keterangan,
      }: { dokumen_nama: string; keterangan: string | null } = req.body;
      const response = await DokumenService.updateMasterDocumentById(
         Number(id as string),
         dokumen_nama,
         keterangan
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(
            `[AppError in updateMasterDocumentById]: ${error.message}`
         );
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in updateMasterDocumentById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in updateMasterDocumentById]: ${JSON.stringify(
               error
            )}`
         );
      }
      next(error);
   }
}

export async function getAllMasterDocument(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const response = await DokumenService.getAllMasterDocument();
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllMasterDocument]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllMasterDocument]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllMasterDocument]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getMasterDocumentById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const {id} = req.params
      const response = await DokumenService.getMasterDocumentById(Number(id as string));
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getMasterDocumentById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getMasterDocumentById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getMasterDocumentById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function deleteMasterDocumentById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params;
      const response = await DokumenService.deleteMasterDocumentById(
         Number(id as string)
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(
            `[AppError in deleteMasterDocumentById]: ${error.message}`
         );
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in deleteMasterDocumentById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in deleteMasterDocumentById]: ${JSON.stringify(
               error
            )}`
         );
      }
      next(error);
   }
}

export async function createDokumenJalur(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const request: { jalur_id: number; dokumen_id: number } = req.body;
      const response = await DokumenService.createDokumenJalur(
         request.jalur_id,
         request.dokumen_id
      );
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createDokumenJalur]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in createDokumenJalur]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in createDokumenJalur]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getAllDocumentJalur(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const response = await DokumenService.getAllDokumenJalur();
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllDokumenJalur]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllDokumenJalur]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllDokumenJalur]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}


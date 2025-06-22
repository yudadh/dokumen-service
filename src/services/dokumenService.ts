import { uploadFileToGCS, generateSignedUrl } from "../utils/gcsUpload";
import { DokumenRepository } from "../repositories/dokumenRepository";
import { getCurrentTimestamp } from "../utils/datetime";
import { AppError } from "../utils/appError";
import {
   DokumenJalurDTO,
   DokumenSiswaResponse,
   Role,
   UpdateDokumenStatus,
} from "../interfaces/dokumenInterface";
import { Prisma, StatusDokumen } from "@prisma/client";
import { table } from "console";
import { prisma } from "../utils/database";

export class DokumenService {
   static async handleFileUpload(
      file: Express.Multer.File,
      siswaId: number,
      dokumenId: number,
      namaDokumen: string,
      userRole: string
   ): Promise<{
      dokumen_siswa_id: number;
      dokumen_id: number;
      dokumen_url: string;
      status: StatusDokumen;
  }> {
      if (!file) throw new AppError("File is required", 400);

      // Buat nama file unik berdasarkan dokumen_id dan ekstensi file
      const fileExtension = file.originalname.split(".").pop(); // Ekstensi file
      const uniqueFileName = `${siswaId}-${namaDokumen}.${fileExtension}`;

      // Folder sesuai nama dokumen
      const folderName = namaDokumen;

      // Upload file ke GCS
      const filePath = await uploadFileToGCS(file, folderName, uniqueFileName);
      // Menghasilkan Signed URL untuk file yang diunggah
      const signedUrl: { url: string; expiresAt: number } =
         await generateSignedUrl(filePath);

      // Simpan data ke database
      const createdAt: string = new Date().toISOString();
      const status: StatusDokumen = userRole.toLowerCase() === 'adminsd' ? 'VALID_SD' : 'BELUM_VALID'
      const document = await DokumenRepository.createSiswaDocument(
         siswaId,
         dokumenId,
         signedUrl.url,
         filePath,
         new Date(signedUrl.expiresAt),
         status,
         createdAt
      );

      return document;
   }

   static async getDocumentBySiswaId(
      siswaId: number,
      role: Role
   ): Promise<{ response: DokumenSiswaResponse[], nama: string }> {
      const siswa = await DokumenRepository.findNamaSiswa(siswaId)

      if (!siswa) {
         throw new AppError("siswa not found", 404)
      }

      const dokumens = await DokumenRepository.findSiswaDocument(siswa.siswa_id);
      console.log(dokumens)
      // if (!dokumens.length) {
      //    throw new AppError("dokumen siswa not found", 404);
      // }

      const now = Date.now();
      const promisesDokumen = dokumens.map(async (dokumen) => {
         const url_expires_at = new Date(dokumen.url_expires_at).getTime();
         // console.log(url_expires_at - now)
         // console.log(`dokumen id ${dokumen.dokumen_siswa_id} ${url_expires_at < now}`)
         const extractedKeterangan = dokumen.keterangan ? this.extractKeteranganForRole(dokumen.keterangan, role) : null
         if (url_expires_at < now) {
            const signedUrl: { url: string; expiresAt: number } =
               await generateSignedUrl(dokumen.file_path);
            console.log(new Date(signedUrl.expiresAt))
            const update_at = new Date().toISOString();
            await DokumenRepository.createSiswaDocument(
               dokumen.siswa_id,
               dokumen.dokumen_id,
               signedUrl.url,
               dokumen.file_path,
               new Date(signedUrl.expiresAt),
               undefined,
               undefined,
               update_at
            );
            return {
               dokumen_siswa_id: dokumen.dokumen_siswa_id,
               siswa_id: dokumen.siswa_id,
               dokumen_id: dokumen.dokumen_id,
               dokumen_jenis: dokumen.dokumen.dokumen_jenis,
               dokumen_url: signedUrl.url,
               status: dokumen.status,
               keterangan: extractedKeterangan
            };
         } else {
            return {
               dokumen_siswa_id: dokumen.dokumen_siswa_id,
               siswa_id: dokumen.siswa_id,
               dokumen_id: dokumen.dokumen_id,
               dokumen_jenis: dokumen.dokumen.dokumen_jenis,
               dokumen_url: dokumen.dokumen_url,
               status: dokumen.status,
               keterangan: extractedKeterangan
            };
         }
      });
      const response: DokumenSiswaResponse[] = await Promise.all(
         promisesDokumen
      );
      console.log(response)
      return { response, nama: siswa.nama };
   }

   static async updateDocumentStatus(
      dokumenSiswaId: number,
      status: StatusDokumen,
      keterangan: string | null,
      userRole: Role,
      periode_jalur_id: number
   ): Promise<UpdateDokumenStatus> {
      const taggedKeterangan = keterangan ? this.addTagKeteranganForRole(keterangan, userRole) : null
      
      const dokumenSiswa = await DokumenRepository.findDocumentByDocumentSiswaId(dokumenSiswaId)
      if (!dokumenSiswa) {
         throw new AppError("dokumen siswa not found", 404)
      }
      const pendaftaranSiswa = await DokumenRepository.findPendaftaranSiswaBySiswaId(dokumenSiswa.siswa_id, periode_jalur_id)

      if (!pendaftaranSiswa) {
         // throw new AppError(`Pendaftaran siswa not found`, 404)
         const data = await DokumenRepository.updateDocumentStatus(dokumenSiswaId, status, taggedKeterangan)
         return data
      }

      const data = await prisma.$transaction(async (tx) => {
         const dokumenStatus = await DokumenRepository.updateDocumentStatusTx(
            tx,
            dokumenSiswaId,
            status, 
            taggedKeterangan
         );
         
         if (!dokumenStatus) {
            throw new AppError("dokumen siswa not found", 404);
         }

         const dokumenSiswa = await DokumenRepository.findSiswaDocumentTx(tx, dokumenStatus.siswa_id)

         const isAllDokumenValid = dokumenSiswa.every((d) => d.status === 'VALID_SMP')
         console.log(`isAllDokumenValid: ${isAllDokumenValid}`)
         if (isAllDokumenValid) {
            // console.log('ini dijalankan')
            await DokumenRepository.updateStatusPendaftaranSiswa(
               tx, 
               pendaftaranSiswa.pendaftaran_id, 
               'VERIF_SMP'
            )
         } else if (!isAllDokumenValid && pendaftaranSiswa.status === 'VERIF_SMP') {
            await DokumenRepository.updateStatusPendaftaranSiswa(
               tx, 
               pendaftaranSiswa.pendaftaran_id, 
               'VERIF_SD'
            )
         }

         return dokumenStatus
      })
      
      return data;
   }

   static async deleteSiswaDocument(dokumen_siswa_id: number): Promise<{
      dokumen_siswa_id: number;
   }> {
      return await DokumenRepository.deleteSiswaDocument(dokumen_siswa_id);
   }

   private static addTagKeteranganForRole(keterangan: string, role: Role) {
      const TAGS: Record<Role, string> = {
         siswa: '[siswa]',
         adminSD: '[siswa]',
         adminSMP: '[adminSD]',
         adminDisdik: '[adminSMP]'
       };
      
       return `${TAGS[role]} ${keterangan}`
   }

   private static extractKeteranganForRole(keterangan: string, role: Role) {
      const TAGS: Record<Role, string> = {
         siswa: '[siswa]',
         adminSD: '[adminSD]',
         adminSMP: '[adminSD]',
         adminDisdik: '[adminDisdik]'
       };

       const tag = TAGS[role]
       if (keterangan.startsWith(tag)) {
         return keterangan.replace(tag, '').trim()
       }

       return null
   }

   static async createMasterDocument(
      namaDokumen: string,
      is_umum: boolean,
      keterangan: string | null
   ): Promise<{
      dokumen_id: number;
   }> {
      const create_at = new Date().toISOString();
      const newDocument = await DokumenRepository.createMasterDocument(
         namaDokumen,
         is_umum,
         keterangan,
         create_at
      );
      return newDocument;
   }

   static async updateMasterDocumentById(
      dokumen_id: number,
      namaDokumen: string,
      keterangan: string | null
   ): Promise<{
      dokumen_id: number;
   }> {
      const update_at = new Date().toISOString();
      return await DokumenRepository.updateMasterDocumentById(
         dokumen_id,
         namaDokumen,
         keterangan,
         update_at
      );
   }

   static async getAllMasterDocument(): Promise<
      {
         dokumen_id: number;
         dokumen_jenis: string;
         is_umum: boolean,
         keterangan: string | null
      }[]
   > {
      return await DokumenRepository.findAllMasterDocument();
   }

   static async getMasterDocumentById(dokumen_id: number): Promise<{
      dokumen_id: number;
      keterangan: string | null;
      dokumen_jenis: string;
   }> {
      const dokumen = await DokumenRepository.findMasterDocumentById(
         dokumen_id
      );
      if (!dokumen) {
         throw new AppError("dokumen not found", 404);
      }
      
      return dokumen;
   }

   static async deleteMasterDocumentById(dokumen_id: number): Promise<{
      dokumen_id: number;
   }> {
      return await DokumenRepository.deleteMasterDocumentById(dokumen_id);
   }

   static async createDokumenJalur(jalurId: number, dokumenId: number) {
      const create_at = new Date().toISOString();
      const newDokumenJalur = await DokumenRepository.createDokumenJalur(
         jalurId,
         dokumenId,
         create_at
      );
      return newDokumenJalur;
   }

   static async getAllDokumenJalur(): Promise<DokumenJalurDTO[]> {
      const document = await DokumenRepository.findAllDokumenJalur()
      const response: DokumenJalurDTO[] = document.map((doc) => ({
         dokumen_jalur_id: doc.dokumen_jalur_id,
         dokumen_id: doc.dokumen_id,
         dokumen_jenis: doc.dokumen.dokumen_jenis,
         jalur_nama: doc.jalur.jalur_nama
      }))

      return response
   }
}

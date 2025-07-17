import { Prisma, StatusDokumen, StatusPendaftaran } from "@prisma/client";
import { prismaWithLogging as prisma } from "../utils/database";

export class DokumenRepository {
   static async createSiswaDocument(
      siswaId: number,
      dokumenId: number,
      url: string,
      filePath: string,
      expiresAt: Date,
      status?: StatusDokumen,
      createdAt?: string,
      updatedAt?: string
   ) {
      return prisma.dokumenSiswa.upsert({
         where: {
            siswa_id_dokumen_id: {
               siswa_id: siswaId,
               dokumen_id: dokumenId,
            },
         },
         update: {
            dokumen_url: url,
            url_expires_at: expiresAt,
            updated_at: updatedAt,
            keterangan: null
         },
         create: {
            siswa_id: siswaId,
            dokumen_id: dokumenId,
            dokumen_url: url,
            status: status,
            file_path: filePath,
            url_expires_at: expiresAt,
            created_at: createdAt,
         },
         select: {
            dokumen_siswa_id: true,
            dokumen_id: true,
            dokumen_url: true,
            status: true,
            keterangan: true
         },
      });
   }

   static async findNamaSiswa (siswaId: number) {
      return prisma.siswa.findUnique({
         where: { siswa_id: siswaId },
         select: { 
            siswa_id: true,
            nama: true 
         }
      })
   }

   static async updateDocumentStatus(
      dokumenSiswaId: number, 
      status: StatusDokumen,
      keterangan: string | null
   ) {
      return prisma.dokumenSiswa.update({
         where: { dokumen_siswa_id: dokumenSiswaId },
         data: {
            status: status,
            keterangan: keterangan
         },
         select: {
            siswa_id: true,
            dokumen_siswa_id: true,
            status: true
         }
      })
   } 

   static async findDocumentByDocumentSiswaId(dokumenSiswaId: number) {
      return prisma.dokumenSiswa.findUnique({
         where: { dokumen_siswa_id: dokumenSiswaId },
         select: {
            siswa_id: true,
            dokumen_siswa_id: true,
            status: true
         }
      })
   }

   static async findSiswaDocument(siswaId: number) {
      return prisma.dokumenSiswa.findMany({
         where: { siswa_id: siswaId },
         select: {
            dokumen_siswa_id: true,
            dokumen_id: true,
            siswa_id: true,
            dokumen_url: true,
            file_path: true,
            url_expires_at: true,
            status: true,
            keterangan: true,
            dokumen: {
               select: { dokumen_jenis: true },
            },
            siswa: {
               select: {
                  nama: true
               }
            }
         },
      });
   }

   static async findSiswaDocumentTx(tx: Prisma.TransactionClient, siswaId: number) {
      return tx.dokumenSiswa.findMany({
         where: { siswa_id: siswaId },
         select: {
            dokumen_siswa_id: true,
            dokumen_id: true,
            status: true,
         },
      });
   }

   static async deleteSiswaDocument(dokumen_siswa_id: number) {
      return prisma.dokumenSiswa.delete({
         where: { dokumen_siswa_id: dokumen_siswa_id },
         select: { dokumen_siswa_id: true },
      });
   }

   static async updateDocumentStatusTx(
      tx: Prisma.TransactionClient,
      dokumenSiswaId: number,
      status: StatusDokumen,
      keterangan: string | null
   ) {
      return tx.dokumenSiswa.update({
         where: {
            dokumen_siswa_id: dokumenSiswaId,
         },
         data: {
            status: status,
            keterangan: keterangan
         },
         select: {
            siswa_id: true,
            dokumen_siswa_id: true,
            status: true,
         },
      });
   }

   static async findPendaftaranSiswaBySiswaId(siswaId: number, periodeJalurId: number) {
      return prisma.pendaftaran.findUnique({
         where: { 
            siswa_id: siswaId,
            periode_jalur_id: periodeJalurId 
         },
         select: {
            pendaftaran_id: true,
            periode_jalur_id: true,
            status: true
         }
      })
   }

   static async createMasterDocument(
      namaDokumen: string,
      is_umum: boolean,
      keterangan: string | null,
      create_at: string
   ) {
      return prisma.dokumen.create({
         data: {
            dokumen_jenis: namaDokumen,
            is_umum: is_umum,
            keterangan: keterangan,
            created_at: create_at,
         },
         select: {
            dokumen_id: true,
         },
      });
   }

   static async updateMasterDocumentById(
      dokumen_id: number,
      namaDokumen: string,
      keterangan: string | null,
      updated_at: string
   ) {
      return prisma.dokumen.update({
         where: { dokumen_id: dokumen_id },
         data: {
            dokumen_jenis: namaDokumen,
            keterangan: keterangan,
            updated_at: updated_at,
         },
         select: { dokumen_id: true },
      });
   }

   static async findAllMasterDocument() {
      return prisma.dokumen.findMany({
         select: {
            dokumen_id: true,
            dokumen_jenis: true,
            is_umum: true,
            keterangan: true
         },
      });
   }

   static async findMasterDocumentById(dokumen_id: number) {
    return prisma.dokumen.findUnique({
        where: {dokumen_id: dokumen_id},
        select: {
            dokumen_id: true,
            dokumen_jenis: true,
            keterangan: true
        }
    })
   }

   static async deleteMasterDocumentById(dokumen_id: number) {
      return prisma.dokumen.delete({
         where: { dokumen_id: dokumen_id },
         select: { dokumen_id: true },
      });
   }

   static async createDokumenJalur(
      jalurId: number,
      dokumenId: number,
      create_at: string
   ) {
      return prisma.dokumenJalur.create({
         data: {
            jalur_id: jalurId,
            dokumen_id: dokumenId,
            created_at: create_at,
         },
         select: {
            dokumen_jalur_id: true,
         },
      });
   }

   static async updateDokumenJalurById(
      dokumen_jalur_id: number,
      jalurId: number,
      dokumenId: number,
      update_at: string
   ) {
    return prisma.dokumenJalur.update({
        where: {dokumen_jalur_id: dokumen_jalur_id},
        data: {
            jalur_id: jalurId,
            dokumen_id: dokumenId,
            updated_at: update_at
        },
        select: {dokumen_jalur_id: true}
    })
   }

   static async findAllDokumenJalur() {
    return prisma.dokumenJalur.findMany({
        select: {
            dokumen_jalur_id: true,
            dokumen_id: true,
            dokumen: {
               select: {
                  dokumen_jenis: true
               }
            },
            jalur: {
               select: {
                  jalur_nama: true
               }
            }
        }
    })
   }

   // pendaftaran model
   static async updateStatusPendaftaranSiswa(
      tx: Prisma.TransactionClient,
      pendaftaranId: number, 
      status: StatusPendaftaran
      // periodeJalurId: number,
      // siswaId: number
   ) {
      return tx.pendaftaran.update({
         where: {
            pendaftaran_id: pendaftaranId
         },
         data: {
            status: status,
            updated_at: new Date()
         },
         select: {
            pendaftaran_id: true,
            siswa_id: true
         }
      })
   }

   // periode model
   static async findPeriodeActive(now: Date) {
      return prisma.periode.findFirst({
         where: {
            waktu_mulai: {
               lte: now
            },
            waktu_selesai: {
               gte: now
            },
            periodejalur: {
               every: {
                  waktu_mulai: {
                     lte: now
                  },
                  waktu_selesai: {
                     gte: now
                  }
               }
            }
         },
         select: {
            periode_id: true,
            periodejalur: {
               select: {
                  periode_jalur_id: true,
                  waktu_mulai: true,
                  waktu_selesai: true,
                  jadwals: {
                     select: {
                        jadwal_id: true,
                        tahapan: {
                           select: {
                              tahapan_nama: true
                           }
                        },
                        is_closed: true,
                        waktu_mulai: true,
                        waktu_selesai: true
                     }
                  }
               }
            }
         }
      })
   }

   static async findPeriodeJalurActiveByPeriodeId(periodeId: number, now: Date) {
      return prisma.periodeJalur.findFirst({
         where: {
            periode_id: periodeId,
            waktu_mulai: {
               lte: now
            },
            waktu_selesai: {
               gte: now
            }
         },
         select: {
            periode_jalur_id: true
         }
      })
   }

   static async findJadwalsByPeriodeJalurId(periodeJalurId: number) {
      return prisma.jadwal.findMany({
         where: { periode_jalur_id: periodeJalurId },
         select: {
            jadwal_id: true,
            tahapan_id: true,
            tahapan: {
               select: {
                  tahapan_nama: true
               }
            }
         }
      })
   }

   
}

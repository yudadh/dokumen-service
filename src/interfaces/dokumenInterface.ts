import { StatusDokumen } from "@prisma/client";

export interface ApiResponse<T> {
   status: "success" | "error";
   data: T | null;
   meta: any | null;
   error: {
      message: string;
      code: number;
   } | null;
}

export interface DokumenResponse {
   dokumen_siswa_id: number;
   dokumen_url: string;
}

export interface DokumenRequest {
   siswa_id: number;
   // nama: string;
   dokumen_id: number;
   dokumen_jenis: string;
}

export interface DokumenSiswaResponse extends DokumenRequest {
   dokumen_siswa_id: number,
   dokumen_url: string,
   status: StatusDokumen
   keterangan: string | null
}

export interface UpdateDokumenStatus extends Omit<DokumenSiswaResponse, "dokumen_url" | "siswa_id" | "dokumen_id" | "dokumen_jenis" | "keterangan"> {}

export interface JwtPayloadToken {
   user_id: number;
   role: string;
}

export interface DokumenJalurDTO {
   dokumen_jalur_id: number,
   dokumen_id: number,
   dokumen_jenis: string,
   jalur_nama: string
}

export interface DokumenMasterDTO {
   dokumen_jenis: string
   is_umum: boolean,
   keterangan: string | null
}

export type Role = 'siswa' | 'adminSD' | 'adminSMP' | 'adminDisdik'

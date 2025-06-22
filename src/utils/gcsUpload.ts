import { Storage } from '@google-cloud/storage';
import path from 'path';
import { env } from '../config/envConfig';


const storage = new Storage({
  keyFilename: path.join('/secrets', 'bucket-services-account-document-service'), // Path ke kunci JSON service account
  projectId: env.PROJECT_ID,
});

const bucketName = env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

/**
 * Upload file ke Google Cloud Storage
 * @param file File yang akan diunggah
 * @param folderName Nama folder berdasarkan nama dokumen
 * @param uniqueFileName Nama file yang unik berdasarkan dokumen_id
 * @returns URL publik file yang diunggah
 */
export const uploadFileToGCS = async (
  file: Express.Multer.File,
  folderName: string,
  uniqueFileName: string
): Promise<string> => {
  // Path file dalam bucket (folder/nama_file)
  const filePath = `${folderName}/${uniqueFileName}`;
  const fileUpload = bucket.file(filePath);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
    public: false, // File tidak bersifat publik
  });

  return filePath;
};

/**
 * Membuat Signed URL untuk akses file terbatas
 * @param filePath Lokasi file di bucket
 * @returns Signed URL yang valid
 */
export const generateSignedUrl = async (filePath: string): Promise<{url: string, expiresAt: number}> => {
  const file = bucket.file(filePath);
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  // console.log((expiresAt - Date.now()) / 1000 / 60/ 60/ 24)
  // Menghasilkan Signed URL dengan masa berlaku 1 jam (3600 detik)
  const [url] = await file.getSignedUrl({
    action: 'read', // Aksi yang diizinkan, misalnya 'read' untuk membaca file
    expires: expiresAt // Masa berlaku 1 jam
  });

  return {url, expiresAt};
};

import express from "express";
import { authMiddleware } from "../middleware/jwtAuth";
import { roleMiddleware } from "../middleware/verifyRole";
import { validateRequest } from "../middleware/validation";
import {
   requestDokumenSchema,
   requestDokumenParams,
   requestDokumenUpdate,
   requestCreateMasterDokumenBodySchema,
   requestDokumenUpdateParams,
   createDokumenJalurBodySchema,
   uploadDokumenQuerySchema,
   dokumenParamsSchema,
} from "../validation/dokumenSchema";
import * as DokumenController from "../controllers/dokumenController";
import { upload } from "../middleware/multer";
import { verifyPeriodeJalurJadwal } from "../middleware/verifyPeriode";

const router = express.Router();

router.post(
   "/dokumen-siswa/:siswa_id/:dokumen_id",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminDisdik"]),
   validateRequest({ params: requestDokumenSchema, query: uploadDokumenQuerySchema }),
   verifyPeriodeJalurJadwal("pendaftaran"),
   upload.single("file"),
   DokumenController.uploadDocument
);

router.get(
   "/dokumen-siswa/:siswa_id",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   validateRequest({ params: requestDokumenParams }),
   DokumenController.getDocumentBySiswaId
);

router.patch(
   "/dokumen-siswa/status/:dokumen_siswa_id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminSMP", "adminDisdik"]),
   validateRequest({ params: requestDokumenUpdateParams, body: requestDokumenUpdate }),
   verifyPeriodeJalurJadwal("verifikasi"),
   DokumenController.updateDocumentStatus
);

router.delete(
   "/dokumen-siswa/:dokumen_siswa_id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ params: requestDokumenUpdateParams }),
   DokumenController.deleteSiswaDocument
);

// Master Dokumen
router.post(
   "/master-dokumen",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ body: requestCreateMasterDokumenBodySchema }),
   DokumenController.createMasterDocument
);

router.put(
   "/master-dokumen/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: dokumenParamsSchema ,body: requestCreateMasterDokumenBodySchema }),
   DokumenController.updateMasterDocumentById
);

router.get(
   "/master-dokumen",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   DokumenController.getAllMasterDocument
);

router.get(
   "/master-dokumen/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({params: dokumenParamsSchema}),
   DokumenController.getMasterDocumentById
);

router.delete(
   "/master-dokumen/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: dokumenParamsSchema }),
   DokumenController.deleteMasterDocumentById
);

router.post("/dokumen-jalur",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ body: createDokumenJalurBodySchema}),
   DokumenController.createDokumenJalur
)

router.get("/dokumen-jalur",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   DokumenController.getAllDocumentJalur
)

export default router;

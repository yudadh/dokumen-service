import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../utils/logger";
import multer from "multer";
import { AppError } from "../utils/appError";

export const validateRequest =
  (schema: {
    params?: ZodSchema;
    query?: ZodSchema;
    file?: ZodSchema;
    body?: ZodSchema;
  }): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validasi params, jika ada
      if (schema.params) {
        schema.params.parse(req.params);
      }

      // Validasi query, jika ada
      if (schema.query) {
        schema.query.parse(req.query);
      }

      // if (schema.file) {
      //   schema.file.parse(req.file as Express.Multer.File)
      // }

      // Validasi body, jika ada
      if (schema.body) {
        schema.body.parse(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.warn(`Validation error: ${JSON.stringify(errorMessages)}`);

        res.status(400).json({
          status: "error",
          message: "Invalid request data",
          errors: errorMessages,
        });
        return;
      }

      logger.error(`Unexpected error during validation: ${error}`);
      next(error);
    }
  };

  


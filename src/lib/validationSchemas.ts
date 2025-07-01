import { z } from "zod";
import { ErrorHandler } from "@/services/errorHandling";

const safeParseFloat = (value: string): number | null => {
  try {
    if (value === undefined || value === "") return null;
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return null;
    return num;
  } catch (error) {
    ErrorHandler.handleError({
      code: "validation_error",
      message: "Failed to parse numeric value",
      details: { value, error },
      retryable: false,
    });
    return null;
  }
};

export const tradeInputSchema = z.object({
  units: z.string().refine(
    (val) => {
      const num = safeParseFloat(val);
      return num !== null && num > 0;
    },
    { message: "Units must be a positive number." }
  ),
  rate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === "") return true;
        const num = safeParseFloat(val);
        return num === null || num > 0;
      },
      { message: "Rate must be a positive number if provided." }
    ),
  stopLoss: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === "") return true;
        const num = safeParseFloat(val);
        return num === null || num > 0;
      },
      { message: "Stop loss must be a positive number if provided." }
    ),
  takeProfit: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === "") return true;
        const num = safeParseFloat(val);
        return num === null || num > 0;
      },
      { message: "Take profit must be a positive number if provided." }
    ),
});

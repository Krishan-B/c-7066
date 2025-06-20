import { z } from 'zod';

export const tradeInputSchema = z.object({
  units: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Units must be a positive number." }),
  rate: z.string().optional().refine(val => {
    if (val === undefined || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Rate must be a positive number if provided." }),
  stopLoss: z.string().optional().refine(val => {
    if (val === undefined || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Stop loss must be a positive number if provided." }),
  takeProfit: z.string().optional().refine(val => {
    if (val === undefined || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Take profit must be a positive number if provided." }),
});

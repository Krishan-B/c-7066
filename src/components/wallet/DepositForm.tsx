import { useForm } from "react-hook-form";
import { ErrorHandler } from "@/services/errorHandling";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { ArrowDownToLine } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define validation schema
const depositSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Amount must be a number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  cardNumber: z
    .string()
    .min(16, { message: "Card number must be at least 16 characters" })
    .max(19, { message: "Card number is too long" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
    message: "Expiry date must be in MM/YY format",
  }),
  cvv: z
    .string()
    .min(3, { message: "CVV must be at least 3 characters" })
    .max(4, { message: "CVV must be at most 4 characters" }),
});

type DepositFormValues = z.infer<typeof depositSchema>;

const DepositForm = () => {
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const onSubmit = (values: DepositFormValues) => {
    try {
      // In a real app, this would call an API to process the deposit
      // Mock successful deposit
      ErrorHandler.handleSuccess("Deposit initiated", {
        description: `$${values.amount} deposit has been initiated`,
      });
      form.reset();
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: "Failed to process deposit",
        retryFn: () => form.handleSubmit(onSubmit)(),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (USD)</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input placeholder="XXXX XXXX XXXX XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input placeholder="MM/YY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input placeholder="XXX" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Deposit Funds
        </Button>
      </form>
    </Form>
  );
};

export default DepositForm;

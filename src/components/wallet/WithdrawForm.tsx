
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowUpFromLine } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define validation schema
const withdrawSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(parseFloat(val)), { message: "Amount must be a number" })
    .refine(val => parseFloat(val) > 0, { message: "Amount must be greater than 0" }),
  bankName: z.string()
    .min(2, { message: "Bank name is required" }),
  accountNumber: z.string()
    .min(6, { message: "Account number must be at least 6 characters" }),
  routingNumber: z.string()
    .min(9, { message: "Routing number must be 9 digits" })
    .max(9, { message: "Routing number must be 9 digits" }),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

const WithdrawForm = () => {
  const { toast } = useToast();
  
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
    },
  });

  const onSubmit = (values: WithdrawFormValues) => {
    toast({
      title: "Withdrawal requested",
      description: `$${values.amount} withdrawal has been requested`,
      duration: 3000,
    });
    form.reset();
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
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter bank name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="routingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter routing number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline" className="w-full">
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Withdraw Funds
        </Button>
      </form>
    </Form>
  );
};

export default WithdrawForm;

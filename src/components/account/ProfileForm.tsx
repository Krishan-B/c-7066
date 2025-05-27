import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
}

export function ProfileForm() {
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (_values: ProfileFormValues) => {
    // Simulate async save
    try {
      // Example: await api.updateProfile(_values);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated",
        duration: 3000,
        variant: "default",
      });
    } catch {
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          rules={{ required: "Full name is required" }}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: "Enter a valid email address",
            },
          }}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          rules={{
            required: "Phone number is required",
            pattern: {
              value: /^\+?[0-9\s-]{7,15}$/,
              message: "Enter a valid phone number",
            },
          }}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <div className="pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

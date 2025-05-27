import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { usePasswordStrength } from "@/features/auth/hooks/usePasswordStrength";
import { useState } from "react";
import PasswordStrengthIndicator from "@/features/auth/components/register/PasswordStrengthIndicator";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function PasswordForm() {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const { 
    score, 
    getPasswordStrengthLabel, 
    getPasswordStrengthColor,
    feedback,
    meetsMinimumRequirements 
  } = usePasswordStrength(newPassword);
  
  const form = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    // Validate password strength
    if (!meetsMinimumRequirements) {
      toast({
        title: "Password too weak",
        description: "Please choose a stronger password",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Check if passwords match
    if (values.newPassword !== values.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
      duration: 3000,
    });
    form.reset();
    setNewPassword("");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter current password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter new password" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setNewPassword(e.target.value);
                  }} 
                />
              </FormControl>
              {newPassword && (
                <PasswordStrengthIndicator 
                  password={newPassword}
                  confirmPassword={form.getValues("confirmPassword")}
                  passwordStrength={score}
                  getPasswordStrengthLabel={getPasswordStrengthLabel}
                  getPasswordStrengthColor={getPasswordStrengthColor}
                  feedback={feedback}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4">
          <Button type="submit">Update Password</Button>
        </div>
      </form>
    </Form>
  );
}

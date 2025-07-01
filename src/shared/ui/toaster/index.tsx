import { Toaster as RadixToaster } from "sonner";

export function Toaster() {
  return (
    <RadixToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
      }}
    />
  );
}

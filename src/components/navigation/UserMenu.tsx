import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorHandler } from "@/services/errorHandling";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigate will be handled by the AuthProvider
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while signing out";
      ErrorHandler.show(error, "Signing out", async () => {
        await signOut();
      });
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          asChild
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Link to="/auth">Sign In</Link>
        </Button>
      </motion.div>
    );
  }

  const userAvatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const userFullName = user.user_metadata?.full_name as string | undefined;
  const userEmail = user.email || "";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatarUrl || ""} alt={userEmail} />
              <AvatarFallback>{userInitial || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userEmail}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userFullName || "User"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/account")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Account
            <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default UserMenu;

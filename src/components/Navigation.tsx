import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowRight,
  ChevronDown,
  Github,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react"
import * as React from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"

const components: { title: string; href: string; description?: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/components/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/components/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/components/progress",
    description:
      "Displays the progress of a task or process.",
  },
  {
    title: "Separator",
    href: "/docs/components/separator",
    description:
      "Visually separates content into groups.",
  },
  {
    title: "Scroll Area",
    href: "/docs/components/scroll-area",
    description: "A scrollable region with custom styling.",
  },
  {
    title: "Tabs",
    href: "/docs/components/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/components/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link to="/markets" className="text-sm font-medium capitalize">
              Markets
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] grid-cols-1 sm:grid-cols-2">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className="relative flex h-full w-full select-none flex-col justify-end rounded-md bg-muted p-6 no-underline outline-none focus:shadow-md"
                  >
                    <div className="absolute inset-0 overflow-hidden rounded-md">
                      <AspectRatio ratio={3 / 1}>
                        <img
                          src="/examples/dashboard-preview.png"
                          alt="dashboard preview"
                          className="object-cover"
                        />
                      </AspectRatio>
                    </div>
                    <div className="mt-4 text-lg font-medium">
                      Dashboards
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components that you can copy and
                      paste into your apps. Accessible. Customizable. Open
                      Source.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              {components.map((component) => (
                <li key={component.title}>
                  <NavigationMenuLink asChild>
                    <NavLink
                      to={component.href}
                      className="block capitalize font-medium text-sm leading-none transition-colors hover:text-foreground focus:text-foreground"
                    >
                      {component.title}
                      {component.description ? (
                        <p className="line-clamp-2 text-sm leading-tight text-muted-foreground">
                          {component.description}
                        </p>
                      ) : null}
                    </NavLink>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link to="/portfolio" className="text-sm font-medium capitalize">
              Portfolio
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <li key={component.title}>
                  <NavigationMenuLink asChild>
                    <NavLink
                      to={component.href}
                      className="block capitalize font-medium text-sm leading-none transition-colors hover:text-foreground focus:text-foreground"
                    >
                      {component.title}
                      {component.description ? (
                        <p className="line-clamp-2 text-sm leading-tight text-muted-foreground">
                          {component.description}
                        </p>
                      ) : null}
                    </NavLink>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link to="/orders" className="text-sm font-medium capitalize">
              Orders
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <li key={component.title}>
                  <NavigationMenuLink asChild>
                    <NavLink
                      to={component.href}
                      className="block capitalize font-medium text-sm leading-none transition-colors hover:text-foreground focus:text-foreground"
                    >
                      {component.title}
                      {component.description ? (
                        <p className="line-clamp-2 text-sm leading-tight text-muted-foreground">
                          {component.description}
                        </p>
                      ) : null}
                    </NavLink>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface MobileNavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  title: string
  href: string
}

function MobileNavItem({ children, title, href, ...props }: MobileNavItemProps) {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(href)
  }

  return (
    <Button variant="ghost" className="justify-start p-0 capitalize" onClick={onClick}>
      {title}
    </Button>
  )
}

interface NavigationProps {
  onMenuToggle?: () => void;
}

export function Navigation({ onMenuToggle }: NavigationProps) {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const [open, setOpen] = React.useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate("/auth")
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="mr-4 flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            Tradable
          </span>
        </Link>
        <MainNav className="mx-6" />
        <nav className="flex items-center space-x-1">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="image" />
                    <AvatarFallback>
                      {user?.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/account")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/auth?mode=signIn">
                Sign In
              </Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="pl-0 ml-2 md:hidden"
                onClick={onMenuToggle}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader className="text-left">
                <SheetTitle>Tradable</SheetTitle>
                <SheetDescription>
                  Manage your account settings.
                </SheetDescription>
              </SheetHeader>
              <MobileNavItem title="Dashboard" href="/" />
              <MobileNavItem title="Markets" href="/markets" />
              <MobileNavItem title="Portfolio" href="/portfolio" />
              <MobileNavItem title="Orders" href="/orders" />
              <MobileNavItem title="Wallet" href="/wallet" />
              <MobileNavItem title="Account" href="/account" />
              <MobileNavItem title="Profile" href="/profile" />
              <Separator />
              {user ? (
                <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                  Log Out
                </Button>
              ) : (
                <MobileNavItem title="Sign In" href="/auth?mode=signIn" />
              )}
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  );
}

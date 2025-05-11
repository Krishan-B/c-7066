
import * as React from "react"
import { Link, NavLink } from "react-router-dom"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

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

export default MainNav;

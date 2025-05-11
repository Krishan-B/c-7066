
import * as React from "react"
import { Link } from "react-router-dom"
import AccountMetrics from "./AccountMetrics"

const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return (
    <div className="hidden md:flex flex-1 overflow-x-auto">
      <AccountMetrics />
    </div>
  )
}

export default MainNav;

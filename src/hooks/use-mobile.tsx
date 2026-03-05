import * as React from "react"
import { BREAKPOINT_MD } from "@/lib/constants"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT_MD - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINT_MD)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINT_MD)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

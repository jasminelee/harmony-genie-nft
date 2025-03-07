// import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // Use system theme by default
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  
  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const updateTheme = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", mediaQuery.matches)
      }
    }
    
    updateTheme()
    mediaQuery.addEventListener("change", updateTheme)
    
    return () => mediaQuery.removeEventListener("change", updateTheme)
  }, [theme])

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

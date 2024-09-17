'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"

export default function ModernHeader() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <nav className="bg-background/80 backdrop-blur-md shadow-lg rounded-full px-6 py-2 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-sm text-foreground hover:text-primary transition-colors duration-300">
            Home
          </Link>
          <Link href="/companies" className="text-sm text-foreground hover:text-primary transition-colors duration-300">
            Companies
          </Link>
          <Link href="/contact" className="text-sm text-foreground hover:text-primary transition-colors duration-300">
            Contact
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-2 ml-4">
          {session?.user ? (
            <div className="relative user-menu">
              <Button
                variant="ghost"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-sm"
              >
                <span className="max-w-[100px] truncate">{session.user.name}</span>
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-10">
                  <Button
                    variant="ghost"
                    onClick={() => { signOut(); setIsDropdownOpen(false); }}
                    className="w-full justify-start text-sm"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => signIn("google")}
              size="sm"
              className="text-sm"
            >
              Login
            </Button>
          )}
          <ThemeToggle />
        </div>
        
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-foreground hover:text-primary transition-colors duration-300"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </nav>
      
      {isMenuOpen && (
        <div className="md:hidden mt-2 bg-background/80 backdrop-blur-md shadow-lg rounded-lg p-4 space-y-2">
          <Link href="/" className="block text-sm text-foreground hover:text-primary transition-colors duration-300">
            Home
          </Link>
          <Link href="/companies" className="block text-sm text-foreground hover:text-primary transition-colors duration-300">
            Companies
          </Link>
          <Link href="/contact" className="block text-sm text-foreground hover:text-primary transition-colors duration-300">
            Contact
          </Link>
          <div className="pt-2 flex items-center justify-between">
            {session?.user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm max-w-[100px] truncate">{session.user.name}</span>
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
              </div>
            ) : (
              <Button
                onClick={() => signIn("google")}
                size="sm"
                className="text-sm"
              >
                Login
              </Button>
            )}
            <ThemeToggle />
          </div>
          {session?.user && (
            <Button
              onClick={() => signOut()}
              variant="outline"
              size="sm"
              className="w-full text-sm mt-2"
            >
              Logout
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
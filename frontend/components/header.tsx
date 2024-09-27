'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import { computeAvatarFallback, createSupabaseClient } from "@/lib/utils"
import { Session } from '@supabase/supabase-js'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const supabase = createSupabaseClient()

export default function ModernHeader() {
  const [session, setSession] = useState<Session | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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

  const handleSignIn = async () => {

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

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
                <span className="max-w-[100px] truncate">{session.user.user_metadata.full_name}</span>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session.user.user_metadata.avatar_url} alt={session.user.user_metadata.full_name || "User"}/>
                  <AvatarFallback>{computeAvatarFallback(session.user.user_metadata.full_name || "User")}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-10">
                  <Link href="/user" passHref>
                    <Button
                      variant="ghost"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full justify-start text-sm"
                    >
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-sm"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={handleSignIn}
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
                <span className="text-sm max-w-[100px] truncate">{session.user.user_metadata.full_name}</span>
                {session.user.user_metadata.avatar_url && (
                  <Image
                    src={session.user.user_metadata.avatar_url}
                    alt={session.user.user_metadata.full_name || "User"}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
              </div>
            ) : (
              <Button
                onClick={handleSignIn}
                size="sm"
                className="text-sm"
              >
                Login
              </Button>
            )}
            <ThemeToggle />
          </div>
          {session?.user && (
            <div>
              <Link
                href="/profile"
                className="block text-sm text-foreground hover:text-primary transition-colors duration-300"
              >
                Profile
              </Link>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="w-full text-sm mt-2"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
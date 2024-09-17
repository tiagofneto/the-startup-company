import { Button } from "@/components/ui/button"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"
import { signIn } from "@/auth"

export default function Home() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10">
      <div className="container px-4 md:px-6 py-10 md:py-14">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
              Welcome to the Isle of Sark Register of Companies
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl">
              Sark is pioneering a new way to register digital companies fit for the 21st century.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="text-lg">
              <Link href="/incorporation">Register Company</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="text-lg">
              <Link href="/companies">Search Companies House</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
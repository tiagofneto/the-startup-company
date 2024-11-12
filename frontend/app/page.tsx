import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LockKeyhole } from 'lucide-react';

export default function Home({
  searchParams
}: {
  searchParams: { requiresAuth: string };
}) {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10">
      <div className="container px-4 md:px-6 py-10 md:py-14">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none animate-fade-up animate-delay-[200ms] animate-once">
              Sark's Digital Company Register
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl animate-fade-up animate-delay-[800ms] animate-once">
              Sark is pioneering a new way to register digital companies fit for the 21st century.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-up animate-delay-[1400ms] animate-once">
            <Button asChild size="lg" className="text-lg">
              <Link href="/incorporation">Register Company</Link>
            </Button>
          </div>
        </div>
      </div>
      {searchParams.requiresAuth && (
        <div className="fixed top-4 right-4 max-w-sm animate-bounce">
          <Alert>
            <LockKeyhole className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You must be logged in to access this page.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </section>
  );
}
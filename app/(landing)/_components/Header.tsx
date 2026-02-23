// app/components/LandingHeader.tsx
import Link from "next/link";
import { getUser } from "@/actions/auth";
import Brand from "@/app/_components/Brand";

export default async function LandingHeader() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        
        {/* Logo */}
        <div className="flex items-center">
          <Brand href={user ? "/feed" : "/"} />
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/feed" className="hover:text-black transition flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Feed
          </Link>
          <Link href="/" className="hover:text-black transition">
            Documentation
          </Link>
          <Link href="#" className="hover:text-black transition">
            Product
          </Link>
          <Link href="#" className="hover:text-black transition">
            Enterprise
          </Link>
          <Link href="#" className="hover:text-black transition">
            Resources
          </Link>
          <Link href="#" className="hover:text-black transition">
            Pricing
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user?.id ? (
            <Link href={`/author/${user.id}`}>
              <button
                className="inline-flex items-center justify-center h-8 px-5 rounded-full text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signin">
                <button
                  className="inline-flex items-center justify-center h-8 px-5 rounded-full text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Login
                </button>
              </Link>

              {/* <button
                className="inline-flex items-center justify-center h-8 px-5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Get a demo
              </button> */}

              <Link href="/auth/register">
                <button
                  className="inline-flex items-center justify-center h-8 px-6 rounded-full text-sm font-medium bg-black text-white hover:bg-black/90 transition-colors"
                >
                  Start for free
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
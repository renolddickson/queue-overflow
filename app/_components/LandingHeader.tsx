"use client";
import { getUser } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useHasMounted } from '@/hooks/useHasMounted';
import Logo from '@/components/common/Logo';

export const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasMounted = useHasMounted();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser();
        if (data) {
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between w-full px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-bold hover:text-primary transition-colors text-primary">
            Discover
          </Link>
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#showcase" className="text-sm font-medium hover:text-primary transition-colors">
            Showcase
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Enterprise
          </Link>
          <Link href="/feedback" className="text-sm font-medium hover:text-primary transition-colors">
            Support
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-100 animate-pulse rounded" />
          ) : user && user.id ? (
            <Link href={`/author/${user.id}`}>
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-6 bg-background animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-4">
            <Link href="#features" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>
            <Link href="#showcase" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Showcase
            </Link>
            <Link href="#" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Enterprise
            </Link>
            <Link href="/feedback" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Support
            </Link>
            <div className="pt-4 border-t flex flex-col gap-2">
              {isLoading ? (
                <div className="w-full h-8 bg-gray-100 animate-pulse rounded" />
              ) : user && user.id ? (
                <Link href={`/author/${user.id}`}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button className="w-full justify-start" size="sm">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

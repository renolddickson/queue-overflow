"use client";
import { Button } from '@/components/ui/button'
import { AudioWaveform, Menu, X } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

export const LandingHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2">
    <div className="container flex h-16 items-center justify-between mx-auto">
      <div className="flex items-center gap-2">
        <AudioWaveform className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Q(ue)*2</span>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
          Features
        </Link>
        <Link href="#demo" className="text-sm font-medium transition-colors hover:text-primary">
          Demo
        </Link>
        <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
          Pricing
        </Link>
        <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
          Documentation
        </Link>
      </nav>

      <div className="hidden md:flex items-center gap-4">
        <Link href="/auth">
        <Button variant="outline" size="sm">
          Log in
        </Button>
        </Link>
        <Link href="/auth">
        <Button size="sm">Sign up</Button>
        </Link>
      </div>

      {/* Mobile menu button */}
      <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>

    {/* Mobile Navigation */}
    {isMenuOpen && (
      <div className="md:hidden border-t py-4 px-6 bg-background">
        <nav className="flex flex-col space-y-4">
          <Link
            href="#features"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#demo"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Demo
          </Link>
          <Link
            href="#"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Documentation
          </Link>
          <div className="pt-4 flex flex-col gap-2">
            <Link href="/auth">
            <Button variant="outline" className="w-full justify-center">
              Log in
            </Button>
            </Link>
            <Link href="/auth">
            <Button className="w-full justify-center">Sign up</Button>
            </Link>
          </div>
        </nav>
      </div>
    )}
  </header>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Code, FileText, AlertTriangle, Quote, CheckCircle, ArrowRight, Menu, X ,Image as IMG, AudioWaveform } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Refs for intersection observer animations
  const heroRef = useRef<HTMLDivElement>(null)
  const featureRef = useRef<HTMLDivElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Animation states
  const [heroVisible, setHeroVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)
  const [demoVisible, setDemoVisible] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setHeroVisible(true)
          heroObserver.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const featureObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true)
          featureObserver.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const demoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setDemoVisible(true)
          demoObserver.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCtaVisible(true)
          ctaObserver.unobserve(entry.target)
        }
      })
    }, observerOptions)

    if (heroRef.current) heroObserver.observe(heroRef.current)
    if (featureRef.current) featureObserver.observe(featureRef.current)
    if (demoRef.current) demoObserver.observe(demoRef.current)
    if (ctaRef.current) ctaObserver.observe(ctaRef.current)

    return () => {
      if (heroRef.current) heroObserver.unobserve(heroRef.current)
      if (featureRef.current) featureObserver.unobserve(featureRef.current)
      if (demoRef.current) demoObserver.unobserve(demoRef.current)
      if (ctaRef.current) ctaObserver.unobserve(ctaRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
          <div
            className={`container px-4 md:px-6 transition-all duration-1000 transform mx-auto ${
              heroVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Documentation Simplified
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Beautiful Documentation <br className="hidden sm:inline" />
                <span className="text-primary">Made Simple</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Create stunning documentation with rich formatting, code blocks, and interactive elements. No coding
                required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </div>
            </div>

            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-40 bottom-0"></div>
              <div className="relative mx-auto max-w-4xl rounded-lg border shadow-2xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=1200"
                  width={1200}
                  height={600}
                  alt="Queue Dashboard"
                  className="w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featureRef} className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Documentation Features
              </h2>
              <p className="mt-4 text-muted-foreground md:text-xl max-w-3xl mx-auto">
                Everything you need to create professional documentation that your users will love.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Code className="h-10 w-10 text-primary" />,
                  title: "Beautiful Code Blocks",
                  description: "Syntax highlighting for over 100 languages with customizable themes and line numbers.",
                  delay: 0,
                },
                {
                  icon: <Quote className="h-10 w-10 text-primary" />,
                  title: "Rich Text Formatting",
                  description: "Create beautiful quotes, callouts, and text formatting to make your docs stand out.",
                  delay: 100,
                },
                {
                  icon: <AlertTriangle className="h-10 w-10 text-primary" />,
                  title: "Warning & Info Boxes",
                  description:
                    "Highlight important information with customizable alert boxes for warnings, tips, and notes.",
                  delay: 200,
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-primary" />,
                  title: "Version Control",
                  description: "Track changes, compare versions, and roll back to previous documentation states.",
                  delay: 300,
                },
                {
                  icon: <FileText className="h-10 w-10 text-primary" />,
                  title: "Organized Structure",
                  description: "Create nested documentation with an automatically generated table of contents.",
                  delay: 400,
                },
                {
                  icon: <IMG className="h-10 w-10 text-primary" />,
                  title: "Rich Media Support",
                  description: "Embed images, videos, and interactive elements to enhance your documentation.",
                  delay: 500,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`flex flex-col p-6 bg-background rounded-lg border shadow-sm transition-all duration-700 transform ${
                    featuresVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${feature.delay}ms`,
                  }}
                >
                  <div className="p-2 rounded-full bg-primary/10 w-fit mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" ref={demoRef} className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">See Queue in Action</h2>
              <p className="mt-4 text-muted-foreground md:text-xl max-w-3xl mx-auto">
                Experience how Queue transforms your documentation workflow.
              </p>
            </div>

            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 transform ${
                demoVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="space-y-6 order-2 lg:order-1">
                <div className="p-6 rounded-lg border bg-background shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" /> Code Blocks
                  </h3>
                  <div className="p-4 bg-muted rounded-md font-mono text-sm overflow-x-auto">
                    <pre>
                      <code>{`function greeting() {
  return "Hello, Queue!";
}

// Syntax highlighting for all languages
const result = greeting();
console.log(result);`}</code>
                    </pre>
                  </div>
                </div>

                <div className="p-6 rounded-lg border bg-background shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Quote className="h-5 w-5 text-primary" /> Beautiful Quotes
                  </h3>
                  <div className="pl-4 border-l-4 border-primary/70 italic">
                    <p>
                      Queue has transformed how we create and maintain our product documentation. Our team
                      productivity has increased by 40%.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">— Sarah Johnson, Product Manager</p>
                  </div>
                </div>

                <div className="p-6 rounded-lg border bg-background shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" /> Warning Boxes
                  </h3>
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-md text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">Make sure to save your changes before navigating away from this page.</p>
                  </div>
                </div>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
                <div className="relative rounded-lg border shadow-xl overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    width={800}
                    height={600}
                    alt="Queue Editor Interface"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-20 bg-primary/5">
          <div
            className={`container px-4 md:px-6 transition-all duration-1000 transform mx-auto ${
              ctaVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Documentation?
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Join thousands of teams who have simplified their documentation process with Queue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">No credit card required. 14-day free trial.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Queue</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Beautiful documentation made simple. Create, manage, and share professional documentation with ease.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Queue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


"use client";
import React, { useEffect, useRef, useState } from 'react'
import Image from "next/image"
import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Quote, AlertTriangle ,Image as IMG, FileText, Youtube } from 'lucide-react'
import Link from 'next/link';

export const Hero = () => {
    
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
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Hero Section */}
    <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
      <div
        className={`flex flex-col md:flex-row px-4 md:px-6 transition-all duration-1000 transform mx-auto ${
          heroVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="w-full flex flex-col space-y-4 items-center md:w-1/2 md:items-start">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Documentation <br className="hidden sm:inline" />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Create stunning documentation with rich formatting, code blocks, and interactive elements. No coding
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href="/feed">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            </Link>
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
              icon: <Youtube className="h-10 w-10 text-primary" />,
              title: "Youtube  Iframe",
              description: "Embed your youtube video easily.",
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
                    console.log(result);`}
                  </code>
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
  )
}

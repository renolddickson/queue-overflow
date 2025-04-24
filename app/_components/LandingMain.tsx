import React from 'react'
import HeroSection from './HeroSection'
import FeatureSection from './FeaturedSection'
import CallToAction from './CallToAction'

export const LandingMain = () => {
  return (
    <main className="flex-grow">
      <HeroSection />
      <FeatureSection />
      
      <section id="examples" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See What You Can Create</h2>
            <p className="text-xl text-gray-600">
              Explore examples of beautiful documents and blogs created with WriteVerse
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blog Example Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-48 bg-blue-500 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-medium">
                  Blog Post Example
                </div>
              </div>
              <div className="p-5">
                <span className="text-sm text-blue-600 font-medium">Tutorial</span>
                <h3 className="text-xl font-bold mt-1 mb-2">Getting Started with React Hooks</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Learn how to use React Hooks to simplify your components and manage state effectively.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                  <span>Jane Smith</span>
                  <span className="mx-2">•</span>
                  <span>5 min read</span>
                </div>
              </div>
            </div>
            
            {/* Documentation Example Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-48 bg-purple-500 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-medium">
                  Documentation Example
                </div>
              </div>
              <div className="p-5">
                <span className="text-sm text-purple-600 font-medium">API Reference</span>
                <h3 className="text-xl font-bold mt-1 mb-2">Product API Documentation</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Comprehensive guide to using our REST API with code examples and best practices.
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">15 pages</span>
                  <span className="text-purple-600">View Documentation →</span>
                </div>
              </div>
            </div>
            
            {/* Knowledge Base Example Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-green-500 to-teal-500 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-medium">
                  Knowledge Base Example
                </div>
              </div>
              <div className="p-5">
                <span className="text-sm text-green-600 font-medium">Help Center</span>
                <h3 className="text-xl font-bold mt-1 mb-2">User Guide & FAQ</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Find answers to common questions and learn how to get the most out of our platform.
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">42 articles</span>
                  <span className="text-green-600">Browse Articles →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <CallToAction />
    </main>
  )
}
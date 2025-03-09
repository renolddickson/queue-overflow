// app/q/view/[...slug]/loading.tsx

export default function Loading() {
    return (
      <div className="flex min-h-screen bg-white">
        {/* Left Panel Skeleton: hidden on small screens */}
        <div className="hidden md:block w-64 border-r px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)] bg-gray-100">
          <div className="space-y-4">
            <div className="h-10 w-full bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
          </div>
        </div>
  
        {/* Right Side Content Skeleton: occupies remaining space */}
        <div className="flex-1 p-4">
          {/* Header Skeleton */}
          <div className="h-12 w-full bg-gray-300 rounded mb-4" />
          {/* Main content skeleton blocks */}
          <div className="space-y-4">
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    );
  }
  
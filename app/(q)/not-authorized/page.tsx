import Link from 'next/link';
import React from 'react';

const AccessDeniedPage = () => {
  return (
    <div className="min-h-full w-full flex items-center justify-center">
      <div className="bg-opacity-90 p-10 rounded-lg text-center max-w-md">
        {/* Lock Icon with subtle bounce animation */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-16 w-16 text-red-600 mb-4 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0-1.105-.895-2-2-2s-2 .895-2 2v2h4v-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11V7a5 5 0 0110 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-md text-gray-600 mb-6">
          Oops! It looks like you don’t have permission to view this page.
          If you think this is a mistake, please contact support.
        </p>
        <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white font-semibold py-2 px-6 rounded-full">
            Return Home
        </Link>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

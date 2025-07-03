import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // For GitHub Pages, redirect to home
    const timer = setTimeout(() => {
      window.location.href = '/community-fee-management/';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">
            Redirecting you to the Community Fee Management System...
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/community-fee-management/"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
            >
              Go to Home
            </a>
            <a
              href="/community-fee-management/dashboard"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors inline-block"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Community Fee Management System</p>
          <p>Demo Version - GitHub Pages</p>
          <p className="mt-2">
            If you continue to see this page, please visit:{' '}
            <a 
              href="/community-fee-management/" 
              className="text-indigo-600 hover:underline"
            >
              https://hambrianglory.github.io/community-fee-management/
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

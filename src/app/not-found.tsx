export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
          
          <div className="mt-4">
            <a
              href="/admin"
              className="inline-block text-blue-600 hover:text-blue-800 underline"
            >
              Admin Login
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Community Fee Management System</p>
        </div>
      </div>
    </div>
  );
}

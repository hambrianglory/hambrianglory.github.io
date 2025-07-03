'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      hasLocalStorage: typeof localStorage !== 'undefined',
      token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : 'no-localStorage',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
  }, []);

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setDebugInfo(prev => ({
        ...prev,
        apiTest: {
          status: response.status,
          data: data,
          success: response.ok
        }
      }));
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        apiTest: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="space-y-4">
          <button 
            onClick={testApiCall}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test API Call
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin'}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
          >
            Go to Admin (Direct)
          </button>
          
          <button 
            onClick={() => {
              localStorage.setItem('token', 'test-token');
              setDebugInfo(prev => ({ ...prev, tokenSet: true }));
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 ml-4"
          >
            Set Test Token
          </button>
        </div>
      </div>
    </div>
  );
}

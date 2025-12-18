import React, { useState } from 'react';

const TestAPI: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">🧪 API Test</h3>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 mb-3"
      >
        {loading ? 'Testing...' : 'Test Gemini API'}
      </button>

      {result && (
        <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAPI;

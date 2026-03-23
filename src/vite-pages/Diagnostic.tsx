import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  details?: any;
}

export default function Diagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Environment
    diagnosticResults.push({
      test: 'Environment Check',
      status: 'info',
      message: 'Current environment details',
      details: {
        origin: window.location.origin,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        href: window.location.href,
        userAgent: navigator.userAgent,
      }
    });

    // Test 2: Router type
    diagnosticResults.push({
      test: 'Router Type',
      status: 'info',
      message: 'Checking router configuration',
      details: {
        routerType: window.location.hash ? 'HashRouter (uses #)' : 'BrowserRouter (clean URLs)',
        baseURL: document.querySelector('base')?.href || 'No base tag found',
      }
    });

    // Test 3: Route navigation
    diagnosticResults.push({
      test: 'Route Navigation Test',
      status: 'info',
      message: 'Testing navigation capability',
      details: {
        testUrl: '/properties/c44bd3bc-6cc0-441c-9475-c8e13f395cd6',
        canPushState: typeof window.history.pushState === 'function',
      }
    });

    // Test 4: Supabase config
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    diagnosticResults.push({
      test: 'Supabase Configuration',
      status: (supabaseUrl && supabaseKey) ? 'pass' : 'fail',
      message: (supabaseUrl && supabaseKey) ? 'Supabase configured' : 'Supabase config missing',
      details: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlPreview: supabaseUrl ? supabaseUrl.substring(0, 40) + '...' : 'missing',
      }
    });

    // Test 5: Fetch property data via Supabase client
    try {
      const testId = 'c44bd3bc-6cc0-441c-9475-c8e13f395cd6';
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, status, images')
        .eq('id', testId)
        .single();

      diagnosticResults.push({
        test: 'Property Data Fetch (target ID)',
        status: data ? 'pass' : 'fail',
        message: data ? `Found: ${data.title}` : 'Property not found',
        details: {
          error: error?.message || null,
          hasImages: data?.images?.length || 0,
          status: data?.status,
        }
      });
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Property Data Fetch (target ID)',
        status: 'fail',
        message: 'Data fetch failed',
        details: { error: error.message }
      });
    }

    // Test 6: General property list fetch
    try {
      const { data, error, count } = await supabase
        .from('properties')
        .select('id', { count: 'exact' })
        .limit(1);

      diagnosticResults.push({
        test: 'Property List Fetch',
        status: data ? 'pass' : 'fail',
        message: data ? `Properties accessible (count: ${count})` : 'Cannot list properties',
        details: { error: error?.message || null, count }
      });
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Property List Fetch',
        status: 'fail',
        message: 'List fetch failed',
        details: { error: error.message }
      });
    }

    // Test 7: Build config
    diagnosticResults.push({
      test: 'Build Configuration',
      status: 'info',
      message: 'Build environment variables',
      details: {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD,
        baseUrl: import.meta.env.BASE_URL,
      }
    });

    // Test 8: Edge function reachability
    try {
      const efUrl = `${supabaseUrl}/functions/v1/property-share?id=c44bd3bc-6cc0-441c-9475-c8e13f395cd6`;
      const resp = await fetch(efUrl, { method: 'GET' }).catch(() => null);
      diagnosticResults.push({
        test: 'Edge Function (property-share)',
        status: resp && resp.ok ? 'pass' : 'fail',
        message: resp ? `Status: ${resp.status}` : 'Unreachable',
        details: {
          status: resp?.status,
          contentType: resp?.headers.get('content-type'),
        }
      });
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Edge Function (property-share)',
        status: 'fail',
        message: 'Edge function check failed',
        details: { error: error.message }
      });
    }

    // Test 9: Image loading
    try {
      const { data } = await supabase
        .from('properties')
        .select('images')
        .eq('id', 'c44bd3bc-6cc0-441c-9475-c8e13f395cd6')
        .single();

      if (data?.images?.[0]) {
        const imgUrl = data.images[0];
        const imgResp = await fetch(imgUrl, { method: 'HEAD' }).catch(() => null);
        diagnosticResults.push({
          test: 'Property Image Loading',
          status: imgResp && imgResp.ok ? 'pass' : 'fail',
          message: imgResp ? `Image status: ${imgResp.status}` : 'Image unreachable',
          details: { imageUrl: imgUrl.substring(0, 80) + '...' }
        });
      } else {
        diagnosticResults.push({
          test: 'Property Image Loading',
          status: 'warning',
          message: 'No images found for target property',
        });
      }
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Property Image Loading',
        status: 'fail',
        message: 'Image check failed',
        details: { error: error.message }
      });
    }

    setResults(diagnosticResults);
    setLoading(false);
  };

  const copyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    alert('Diagnostic results copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔍 DR Housing Diagnostic Report</h1>
      <p>Target: <code>https://drhousing.net/properties/c44bd3bc-6cc0-441c-9475-c8e13f395cd6</code></p>
      <p><strong>Router:</strong> BrowserRouter (confirmed in App.tsx) | <strong>Vite base:</strong> "/" (default)</p>

      <button onClick={copyResults} style={{ padding: '10px 20px', marginBottom: '20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        📋 Copy Results to Clipboard
      </button>

      {loading && <p>Running diagnostics...</p>}

      {results.map((result, index) => (
        <div key={index} style={{
          border: '1px solid #ddd',
          borderLeft: `4px solid ${result.status === 'pass' ? '#28a745' : result.status === 'fail' ? '#dc3545' : result.status === 'warning' ? '#ffc107' : '#17a2b8'}`,
          padding: '15px', marginBottom: '10px', backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{result.test}</strong>
            <span style={{
              padding: '4px 8px', borderRadius: '3px', fontSize: '12px',
              backgroundColor: result.status === 'pass' ? '#d4edda' : result.status === 'fail' ? '#f8d7da' : result.status === 'warning' ? '#fff3cd' : '#d1ecf1',
              color: result.status === 'pass' ? '#155724' : result.status === 'fail' ? '#721c24' : result.status === 'warning' ? '#856404' : '#0c5460'
            }}>
              {result.status.toUpperCase()}
            </span>
          </div>
          <p style={{ margin: '10px 0 5px 0' }}>{result.message}</p>
          {result.details && (
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(result.details, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

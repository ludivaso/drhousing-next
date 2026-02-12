import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugSupabase() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tables, setTables] = useState<Record<string, any[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setError(null);
    try {
      const { data, error } = await supabase.from('properties').select('count').limit(1);
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message);
    }
  };

  const fetchTable = async (tableName: 'properties' | 'agents' | 'leads' | 'profiles' | 'user_roles') => {
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(10);
      if (error) throw error;
      setTables(prev => ({ ...prev, [tableName]: data || [] }));
    } catch (err: any) {
      setTables(prev => ({ ...prev, [tableName]: [{ error: err.message }] }));
    }
  };

  const tableNames: Array<'properties' | 'agents' | 'leads' | 'profiles' | 'user_roles'> = ['properties', 'agents', 'leads', 'profiles', 'user_roles'];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Supabase Debug</h1>

        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className={`w-3 h-3 rounded-full ${
                connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="capitalize">{connectionStatus}</span>
              <Button onClick={checkConnection} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="text-sm text-muted-foreground">
              <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
              <p>Project ID: {import.meta.env.VITE_SUPABASE_PROJECT_ID}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tableNames.map(name => (
                <Button key={name} onClick={() => fetchTable(name)} variant="outline" size="sm">
                  Fetch {name}
                </Button>
              ))}
            </div>

            {Object.entries(tables).map(([name, rows]) => (
              <div key={name} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{name} ({rows.length} rows)</h3>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                  {JSON.stringify(rows, null, 2)}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TestEmailPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  const testEmail = async () => {
    try {
      setStatus('loading');
      setMessage('Sending test email...');
      setDetails(null);

      const response = await fetch('/api/test-email?email=abhinavthakur808@gmail.com');
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Test email sent successfully! Please check your inbox.');
        setDetails(data.details);
      } else {
        setStatus('error');
        setMessage(`Error: ${data.error || 'Failed to send test email'}`);
        setDetails(data.details || data.config);
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while sending the test email.');
      setDetails(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
          <CardDescription>
            Click the button below to send a test email to abhinavthakur808@gmail.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={testEmail}
              disabled={status === 'loading'}
              className="w-full"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test Email'
              )}
            </Button>

            {message && (
              <div className={`p-4 rounded-md ${
                status === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : status === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {message}
                {details && (
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import notify from '@/lib/notify';
import { useAdminAuth } from '@/hooks/use-admin-auth';

export default function AdminLoginForm({ className = '', onSuccess }) {
  const { login } = useAdminAuth();
  const [phnNumber, setPhnNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // reset on mount
    setPhnNumber('');
    setName('');
    setPassword('');
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!phnNumber || !password || !name) return notify.warning('Enter name, phone and password');
    setLoading(true);
    try {
      await login({ phn_number: phnNumber, password, name });
      notify.success('Admin login successful');
      onSuccess?.();
    } catch (err) {
      notify.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={`space-y-5 ${className}`}>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          type="text"
          placeholder="Admin Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Phone Number (digits only)</Label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="1234567890"
          value={phnNumber}
          onChange={(e) => setPhnNumber(e.target.value.replace(/[^0-9]/g, ''))}
          maxLength={15}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

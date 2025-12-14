import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');

  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setNameMsg(null);
    try {
      await updateProfile(name.trim());
      setNameMsg('Profile updated successfully.');
    } catch (err) {
      setNameMsg('Failed to update profile.');
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    setPwMsg(null);
    setPwErr(null);
    try {
      if (newPassword.length < 6) {
        setPwErr('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPwErr('New password and confirm password do not match.');
        return;
      }
      await changePassword(currentPassword, newPassword);
      setPwMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwErr(err?.message || 'Failed to change password.');
      console.error(err);
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <Button variant="destructive" onClick={() => logout()}>Logout</Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Update your display name. Email cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            {nameMsg && <p className="text-sm text-gray-700">{nameMsg}</p>}
            <Button type="submit" disabled={savingName}>
              {savingName ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Enter your current password to set a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {pwErr && <p className="text-sm text-red-600">{pwErr}</p>}
            {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
            <Button type="submit" disabled={changingPw}>
              {changingPw ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

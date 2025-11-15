"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, User } from 'lucide-react';
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { put } from '@vercel/blob';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  const [userId, setUserId] = useState<string>('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      setUserId(user.id);
      setEmail(user.email || '');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || '');
        setProfilePicture(profile.profile_picture || null);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);

    try {
      const blob = await put(`profile-pictures/${userId}-${Date.now()}.${file.name.split('.').pop()}`, file, {
        access: 'public',
      });

      setProfilePicture(blob.url);

      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture: blob.url })
        .eq('id', userId);

      if (error) throw error;

      alert(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(t('profile.updateError'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      alert('Display name is required');
      return;
    }

    setSaving(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        email: email,
      });

      if (authError) throw authError;

      alert(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t('profile.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      alert(t('profile.passwordTooShort'));
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        alert(t('profile.wrongPassword'));
        setUpdatingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert(t('profile.passwordSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      alert(t('profile.passwordError'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
      <div className="container mx-auto p-6 max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/game">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('profile.backToGame')}
          </Link>
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-purple-600">{t('profile.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.picture')}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePicture || undefined} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="picture-upload" className="cursor-pointer">
                  <Button type="button" disabled={uploadingImage} asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingImage ? t('profile.uploading') : t('profile.changePicture')}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.displayName')}</CardTitle>
              <CardDescription>Update your display name and email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('profile.displayName')}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? t('profile.saving') : t('profile.saveChanges')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.changePassword')}</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={updatingPassword}>
                {updatingPassword ? t('profile.updating') : t('profile.updatePassword')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

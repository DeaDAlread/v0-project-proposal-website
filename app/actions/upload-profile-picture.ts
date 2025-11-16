"use server"

import { put } from '@vercel/blob';
import { createClient } from '@/lib/supabase/server';

export async function uploadProfilePicture(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { error: 'No file provided' };
    }

    if (!file.type.startsWith('image/')) {
      return { error: 'File must be an image' };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Not authenticated' };
    }

    const blob = await put(
      `profile-pictures/${user.id}-${Date.now()}.${file.name.split('.').pop()}`,
      file,
      {
        access: 'public',
      }
    );

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_picture: blob.url })
      .eq('id', user.id);

    if (updateError) {
      // Check if it's a column missing error
      if (updateError.message.includes('column') && updateError.message.includes('profile_picture')) {
        return { error: 'profile_picture_column_missing' };
      }
      return { error: updateError.message };
    }

    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error('Error in uploadProfilePicture:', error);
    return { error: error.message || 'Failed to upload image' };
  }
}

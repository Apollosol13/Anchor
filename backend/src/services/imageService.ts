import { supabase } from '../lib/supabase';

export class ImageService {
  /**
   * Get all active image presets, optionally filtered by category
   */
  async getPresets(category?: string) {
    try {
      let query = supabase
        .from('image_presets')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching presets:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a random preset for verse of the day
   */
  async getRandomPreset() {
    try {
      const { data, error } = await supabase
        .from('image_presets')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    } catch (error) {
      console.error('Error fetching random preset:', error);
      return null;
    }
  }

  /**
   * Create a new image preset (admin only)
   */
  async createPreset(presetData: {
    name: string;
    imageUrl: string;
    category: string;
    tags?: string[];
    sortOrder?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('image_presets')
        .insert([{
          name: presetData.name,
          image_url: presetData.imageUrl,
          category: presetData.category,
          tags: presetData.tags || [],
          sort_order: presetData.sortOrder || 0,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating preset:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete an image preset (admin only)
   */
  async deletePreset(id: string) {
    try {
      const { error } = await supabase
        .from('image_presets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting preset:', error);
      return { error };
    }
  }

  /**
   * Upload image to Supabase Storage
   */
  async uploadImage(file: Buffer, fileName: string, bucket: string = 'preset-images') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { url: null, error };
    }
  }
}

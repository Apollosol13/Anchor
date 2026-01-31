import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Get user favorites
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add favorite
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, book, chapter, verse, version, text } = req.body;
    
    if (!userId || !book || !chapter || !verse || !version || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        book,
        chapter,
        verse,
        version,
        text,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Verse already in favorites' });
      }
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove favorite
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;

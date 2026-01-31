import { Router, Request, Response } from 'express';
import { ImageService } from '../services/imageService';

const router = Router();
const imageService = new ImageService();

// Get all active image presets
router.get('/presets', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const { data, error } = await imageService.getPresets(category as string);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch presets' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching presets:', error);
    res.status(500).json({ error: 'Failed to fetch image presets' });
  }
});

// Get random preset
router.get('/presets/random', async (req: Request, res: Response) => {
  try {
    const preset = await imageService.getRandomPreset();
    
    if (!preset) {
      return res.status(404).json({ error: 'No presets available' });
    }
    
    res.json(preset);
  } catch (error) {
    console.error('Error fetching random preset:', error);
    res.status(500).json({ error: 'Failed to fetch random preset' });
  }
});

// Admin: Create new preset
router.post('/presets', async (req: Request, res: Response) => {
  try {
    const presetData = req.body;
    
    // TODO: Add authentication middleware to verify admin
    
    const { data, error } = await imageService.createPreset(presetData);
    
    if (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create preset';
      return res.status(400).json({ error: errorMessage });
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating preset:', error);
    res.status(500).json({ error: 'Failed to create preset' });
  }
});

// Admin: Delete preset
router.delete('/presets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Add authentication middleware to verify admin
    
    const { error } = await imageService.deletePreset(id);
    
    if (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete preset';
      return res.status(400).json({ error: errorMessage });
    }
    
    res.json({ message: 'Preset deleted successfully' });
  } catch (error) {
    console.error('Error deleting preset:', error);
    res.status(500).json({ error: 'Failed to delete preset' });
  }
});

export default router;

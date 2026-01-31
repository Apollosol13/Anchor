import { Router, Request, Response } from 'express';
import { OpenAIService } from '../services/openaiService';

const router = Router();
const openaiService = new OpenAIService();

// Explain a verse
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { verse, reference } = req.body;
    
    if (!verse || !reference) {
      return res.status(400).json({ error: 'Verse and reference are required' });
    }
    
    const explanation = await openaiService.explainVerse(verse, reference);
    res.json({ explanation });
  } catch (error) {
    console.error('Error explaining verse:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Get related verses
router.post('/related', async (req: Request, res: Response) => {
  try {
    const { verse, reference } = req.body;
    
    if (!verse) {
      return res.status(400).json({ error: 'Verse is required' });
    }
    
    const relatedVerses = await openaiService.getRelatedVerses(verse);
    res.json({ relatedVerses });
  } catch (error) {
    console.error('Error finding related verses:', error);
    res.status(500).json({ error: 'Failed to find related verses' });
  }
});

// Get study questions
router.post('/study-questions', async (req: Request, res: Response) => {
  try {
    const { verse, reference } = req.body;
    
    if (!verse || !reference) {
      return res.status(400).json({ error: 'Verse and reference are required' });
    }
    
    const questions = await openaiService.generateStudyQuestions(verse, reference);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating study questions:', error);
    res.status(500).json({ error: 'Failed to generate study questions' });
  }
});

export default router;

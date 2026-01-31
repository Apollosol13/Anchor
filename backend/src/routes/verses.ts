import { Router, Request, Response } from 'express';
import { BibleService } from '../services/bibleService';

const router = Router();
const bibleService = new BibleService();

// Get verse of the day
router.get('/verse-of-day', async (req: Request, res: Response) => {
  try {
    const { version = 'WEB', date, timezone } = req.query;
    console.log('📖 API: Fetching verse of the day with version:', version, 'date:', date, 'timezone:', timezone);
    const verse = await bibleService.getVerseOfTheDay(
      version as string, 
      date as string | undefined,
      timezone as string | undefined
    );
    console.log('✅ API: Returning verse:', verse.reference, verse.version);
    res.json(verse);
  } catch (error) {
    console.error('Error fetching verse of the day:', error);
    res.status(500).json({ error: 'Failed to fetch verse of the day' });
  }
});

// Get whole chapter
router.get('/chapter/:bookName/:chapter', async (req: Request, res: Response) => {
  try {
    const { bookName, chapter } = req.params;
    const { version = 'WEB' } = req.query;
    
    const chapterData = await bibleService.getChapter(
      bookName, 
      parseInt(chapter), 
      version as string
    );
    res.json(chapterData);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// Get specific verse
router.get('/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const { version = 'WEB' } = req.query;
    
    const verse = await bibleService.getVerse(reference, version as string);
    res.json(verse);
  } catch (error) {
    console.error('Error fetching verse:', error);
    res.status(500).json({ error: 'Failed to fetch verse' });
  }
});

// Search verses
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { version = 'ESV', limit = 10 } = req.query;
    
    const results = await bibleService.searchVerses(
      query, 
      version as string,
      parseInt(limit as string)
    );
    res.json(results);
  } catch (error) {
    console.error('Error searching verses:', error);
    res.status(500).json({ error: 'Failed to search verses' });
  }
});

// Get available Bible versions
router.get('/versions/list', async (req: Request, res: Response) => {
  try {
    const versions = await bibleService.getAvailableVersions();
    res.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch Bible versions' });
  }
});

export default router;

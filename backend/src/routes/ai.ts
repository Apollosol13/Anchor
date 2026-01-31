import { Router, Request, Response } from 'express';
import { OpenAIService } from '../services/openaiService';
import { supabase } from '../lib/supabase';

const router = Router();
const openaiService = new OpenAIService();

// Rate limiting configuration
const RATE_LIMITS = {
  free: {
    dailyLimit: 10,
    name: 'Free',
  },
  pro: {
    dailyLimit: 100,
    name: 'Pro',
  },
};

// Middleware to check rate limit
async function checkRateLimit(req: Request, res: Response, next: Function) {
  try {
    const userId = req.body.userId;
    const isPro = req.body.isPro || false;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get current usage
    const { data: usageData, error: usageError } = await supabase
      .rpc('get_ai_chat_usage', { p_user_id: userId });

    if (usageError) {
      console.error('Error checking rate limit:', usageError);
      // Allow request on error (fail open)
      return next();
    }

    const usage = usageData?.[0];
    const limit = isPro ? RATE_LIMITS.pro.dailyLimit : RATE_LIMITS.free.dailyLimit;
    const currentCount = usage?.message_count || 0;

    // Check if over limit
    if (currentCount >= limit) {
      const tierName = isPro ? RATE_LIMITS.pro.name : RATE_LIMITS.free.name;
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `You've reached your ${tierName} tier limit of ${limit} messages per day. ${isPro ? 'Try again tomorrow!' : 'Upgrade to Pro for 100 messages per day.'}`,
        currentUsage: currentCount,
        dailyLimit: limit,
        remainingMessages: 0,
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      });
    }

    // Increment usage
    const { error: incrementError } = await supabase
      .rpc('increment_ai_chat_usage', { p_user_id: userId });

    if (incrementError) {
      console.error('Error incrementing usage:', incrementError);
    }

    // Attach usage info to request for response
    req.body.usageInfo = {
      currentUsage: currentCount + 1,
      dailyLimit: limit,
      remainingMessages: limit - (currentCount + 1),
    };

    next();
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request
    next();
  }
}

// Explain a verse
router.post('/explain', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { verse, reference, usageInfo } = req.body;
    
    if (!verse || !reference) {
      return res.status(400).json({ error: 'Verse and reference are required' });
    }
    
    const explanation = await openaiService.explainVerse(verse, reference);
    res.json({ 
      explanation,
      usage: usageInfo, // Include rate limit info in response
    });
  } catch (error) {
    console.error('Error explaining verse:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Get related verses
router.post('/related', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { verse, reference, usageInfo } = req.body;
    
    if (!verse) {
      return res.status(400).json({ error: 'Verse is required' });
    }
    
    const relatedVerses = await openaiService.getRelatedVerses(verse);
    res.json({ 
      relatedVerses,
      usage: usageInfo,
    });
  } catch (error) {
    console.error('Error finding related verses:', error);
    res.status(500).json({ error: 'Failed to find related verses' });
  }
});

// Get study questions
router.post('/study-questions', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { verse, reference, usageInfo } = req.body;
    
    if (!verse || !reference) {
      return res.status(400).json({ error: 'Verse and reference are required' });
    }
    
    const questions = await openaiService.generateStudyQuestions(verse, reference);
    res.json({ 
      questions,
      usage: usageInfo,
    });
  } catch (error) {
    console.error('Error generating study questions:', error);
    res.status(500).json({ error: 'Failed to generate study questions' });
  }
});

export default router;

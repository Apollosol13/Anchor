import express from 'express';

const router = express.Router();

// Generate audio for a chapter using Speechify API
router.post('/generate-chapter-audio', async (req, res) => {
  try {
    const { verses, bookName, chapter, version } = req.body;

    console.log('🎙️ Audio request received:', { 
      versesCount: verses?.length, 
      bookName, 
      chapter, 
      version,
      firstVerse: verses?.[0]
    });

    if (!verses || !Array.isArray(verses)) {
      console.error('❌ Verses validation failed:', { verses });
      return res.status(400).json({ 
        error: 'Verses array is required',
        received: typeof verses
      });
    }

    if (verses.length === 0) {
      console.error('❌ Empty verses array');
      return res.status(400).json({ error: 'Verses array is empty' });
    }

    // Combine all verse text with verse numbers for better listening experience
    const chapterText = verses
      .map((v: any) => {
        const verseNumber = v.verse || v.number || v.verseNumber;
        const verseText = v.text || '';
        return `Verse ${verseNumber}. ${verseText}`;
      })
      .join('. ');

    console.log(`🎙️ Generating audio for ${bookName} ${chapter} (${version})`);
    console.log(`📝 Text length: ${chapterText.length} characters`);

    // Call Speechify API (updated format based on their API docs)
    const speechifyUrl = 'https://api.sws.speechify.com/v1/audio/speech';
    
    const requestBody = {
      input: chapterText,
      voice_id: 'henry',
      model: 'simba-english',
      audio_format: 'mp3',
    };

    console.log('📡 Calling Speechify API:', speechifyUrl);
    console.log('🔑 Using API key:', process.env.SPEECHIFY_API_KEY ? 'Set' : 'Missing');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(speechifyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SPEECHIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Speechify API error:', errorText);
      console.error('📊 Status:', response.status);
      console.error('📋 Headers:', Object.fromEntries(response.headers.entries()));
      return res.status(response.status).json({ 
        error: 'Failed to generate audio',
        details: errorText,
        status: response.status
      });
    }

    const audioData = await response.json() as {
      audio_url?: string;
      url?: string;
      duration?: number;
    };

    console.log(`✅ Audio generated successfully`);

    // Return audio URL and metadata
    res.json({
      audioUrl: audioData.audio_url || audioData.url,
      duration: audioData.duration,
      verseCount: verses.length,
    });

  } catch (error: any) {
    console.error('❌ Error generating audio:', error);
    res.status(500).json({ 
      error: 'Failed to generate audio',
      message: error.message 
    });
  }
});

export default router;

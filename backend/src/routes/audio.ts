import express from 'express';

const router = express.Router();

// Generate audio for a chapter using Speechify API
router.post('/generate-chapter-audio', async (req, res) => {
  try {
    const { verses, bookName, chapter, version } = req.body;

    if (!verses || !Array.isArray(verses)) {
      return res.status(400).json({ error: 'Verses array is required' });
    }

    // Combine all verse text with verse numbers for better listening experience
    const chapterText = verses
      .map((v: any) => `Verse ${v.verse}. ${v.text}`)
      .join('. ');

    console.log(`🎙️ Generating audio for ${bookName} ${chapter} (${version})`);
    console.log(`📝 Text length: ${chapterText.length} characters`);

    // Call Speechify API (correct endpoint based on Speechify docs)
    const speechifyUrl = 'https://api.sws.speechify.com/v1/audio/speech';
    
    const requestBody = {
      audio_format: 'mp3',
      input: chapterText,
      voice_id: 'henry',
      model: 'simba-english',
    };

    console.log('📡 Calling Speechify API:', speechifyUrl);
    console.log('🔑 Using API key:', process.env.SPEECHIFY_API_KEY ? 'Set' : 'Missing');

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
      console.error('Speechify API error:', errorText);
      return res.status(response.status).json({ 
        error: 'Failed to generate audio',
        details: errorText 
      });
    }

    const audioData = await response.json();

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

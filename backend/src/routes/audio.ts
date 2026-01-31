import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Generate audio for a chapter using OpenAI TTS
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

    // Check cache first
    const cacheKey = `${bookName}_${chapter}_${version}`.toLowerCase();
    const { data: cachedAudio } = await supabase
      .from('chapter_audio')
      .select('audio_url, duration')
      .eq('book_name', bookName)
      .eq('chapter', chapter)
      .eq('version', version)
      .single();

    if (cachedAudio) {
      console.log('✅ Using cached audio');
      return res.json({
        audioUrl: cachedAudio.audio_url,
        duration: cachedAudio.duration,
        verseCount: verses.length,
        cached: true,
      });
    }

    // Combine all verse text without verse numbers for natural reading
    // Add intro with book name and chapter
    const introText = `${bookName}, chapter ${chapter}.`;
    const versesText = verses
      .map((v: any) => v.text || '')
      .join(' ');

    const chapterText = `${introText} ${versesText}`;

    console.log(`🎙️ Generating audio for ${bookName} ${chapter} (${version})`);
    console.log(`📝 Text length: ${chapterText.length} characters`);

    // Call OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // HD quality for cleaner, more natural audio
        voice: 'onyx', // Deep male voice
        input: chapterText,
        speed: 0.95, // Slightly slower for better clarity
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI TTS error:', errorText);
      return res.status(response.status).json({ 
        error: 'Failed to generate audio',
        details: errorText,
      });
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    const audioBlob = Buffer.from(audioBuffer);

    // Calculate approximate duration (OpenAI TTS is about 24kbps MP3)
    // At 24kbps: 24000 bits/sec = 3000 bytes/sec
    const approximateDuration = Math.round(audioBlob.length / 3000);

    console.log(`✅ Audio generated: ${audioBlob.length} bytes (~${approximateDuration}s)`);

    // Upload to Supabase Storage
    const fileName = `${cacheKey}_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chapter-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        cacheControl: '31536000', // Cache for 1 year
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload audio' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chapter-audio')
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;
    console.log(`🔗 Audio URL: ${audioUrl}`);

    // Cache for future requests
    await supabase.from('chapter_audio').upsert({
      book_name: bookName,
      chapter: chapter,
      version: version,
      audio_url: audioUrl,
      duration: approximateDuration,
      generated_at: new Date().toISOString(),
    });

    // Return audio URL and metadata
    res.json({
      audioUrl: audioUrl,
      duration: approximateDuration,
      verseCount: verses.length,
      cached: false,
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

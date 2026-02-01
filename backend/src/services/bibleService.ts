import axios from 'axios';
import { supabase } from '../lib/supabase';

interface BibleVerse {
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
}

export class BibleService {
  private apiKey: string;
  private baseUrl = 'https://rest.api.bible/v1';

  // Theme mapping for day of week
  private readonly THEME_MAP: { [key: number]: string } = {
    0: 'rest',      // Sunday - Rest & Worship
    1: 'strength',  // Monday - Strength & Courage
    2: 'peace',     // Tuesday - Peace & Comfort
    3: 'wisdom',    // Wednesday - Wisdom & Guidance
    4: 'love',      // Thursday - Love & Grace
    5: 'faith',     // Friday - Faith & Trust
    6: 'joy'        // Saturday - Joy & Thanksgiving
  };

  constructor() {
    this.apiKey = process.env.BIBLE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  BIBLE_API_KEY not set. Bible API calls will fail.');
    }
  }

  /**
   * Get verse of the day - themed by day of week, deterministic selection from database
   * @param version - Bible version (e.g., 'WEB', 'KJV')
   * @param userDate - Optional date string in YYYY-MM-DD format from user's timezone
   * @param timezone - Optional timezone string (e.g., 'America/New_York')
   */
  async getVerseOfTheDay(version: string = 'WEB', userDate?: string, timezone?: string): Promise<BibleVerse> {
    try {
      // Use provided date or calculate from timezone or fallback to server time
      let dateStr: string;
      let today: Date;

      if (userDate) {
        // User provided their local date (YYYY-MM-DD format)
        dateStr = userDate;
        today = new Date(userDate + 'T00:00:00');
        console.log(`📅 BibleService: Using user-provided date: ${dateStr}`);
      } else if (timezone) {
        // Convert server time to user's timezone
        today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
        today.setHours(0, 0, 0, 0);
        dateStr = today.toISOString().split('T')[0];
        console.log(`🌍 BibleService: Calculated date from timezone ${timezone}: ${dateStr}`);
      } else {
        // Fallback to server timezone
        today = new Date();
        today.setHours(0, 0, 0, 0);
        dateStr = today.toISOString().split('T')[0];
        console.log(`🖥️  BibleService: Using server date: ${dateStr}`);
      }

      console.log(`📖 BibleService: Getting verse of the day for ${dateStr}, version: ${version}`);

      // Check if we already have verse of the day in database for this version
      const { data: cached, error: cacheError } = await supabase
        .from('verse_of_the_day')
        .select('*')
        .eq('date', dateStr)
        .eq('version', version)
        .single();

      if (cached && !cacheError) {
        console.log(`✅ BibleService: Found cached verse:`, cached.book, cached.chapter, cached.verse, cached.version);
        return {
          text: cached.text,
          reference: `${cached.book} ${cached.chapter}:${cached.verse}`,
          book: cached.book,
          chapter: cached.chapter,
          verse: cached.verse,
          version: cached.version
        };
      }

      console.log(`🔍 BibleService: No cache found for ${version}, fetching from verse library...`);

      // Determine theme based on day of week
      const dayOfWeek = today.getDay();
      const theme = this.THEME_MAP[dayOfWeek];

      console.log(`🎨 BibleService: Theme for ${dateStr} (day ${dayOfWeek}): ${theme}`);

      // Get verse from library using SQL function
      const { data: verseData, error: verseError } = await supabase
        .rpc('get_themed_verse', {
          theme_name: theme,
          date_seed: dateStr
        })
        .single() as { 
          data: { 
            book: string; 
            chapter: number; 
            verse: number; 
            reference_code: string; 
            theme: string 
          } | null; 
          error: any 
        };

      if (verseError || !verseData) {
        console.error('❌ BibleService: Error fetching from verse library:', verseError);
        throw new Error('Failed to fetch verse from library');
      }

      console.log(`📖 BibleService: Selected verse: ${verseData.reference_code} from theme "${theme}"`);

      // Fetch full verse text from Bible API
      const verse = await this.getVerse(verseData.reference_code, version);
      console.log(`✅ BibleService: Received verse with version: ${verse.version}`);

      // Cache in database
      console.log(`💾 BibleService: Caching verse for ${dateStr} with version ${version}`);
      await supabase
        .from('verse_of_the_day')
        .insert([{
          date: dateStr,
          book: verseData.book,
          chapter: verseData.chapter,
          verse: verseData.verse,
          version: version,
          text: verse.text,
          created_at: new Date().toISOString()
        }]);

      return verse;
    } catch (error) {
      console.error('❌ BibleService: Error fetching verse of the day:', error);
      // Return fallback verse
      return {
        text: 'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.',
        reference: 'John 3:16',
        book: 'John',
        chapter: 3,
        verse: 16,
        version: 'WEB'
      };
    }
  }

  /**
   * Get a whole chapter
   */
  async getChapter(bookName: string, chapter: number, version: string = 'WEB'): Promise<any> {
    try {
      const bibleId = this.getVersionId(version);
      const bookCode = this.getBookCode(bookName);
      const chapterId = `${bookCode}.${chapter}`;
      
      // Get verses endpoint which returns properly numbered verses
      const response = await axios.get(
        `${this.baseUrl}/bibles/${bibleId}/chapters/${chapterId}/verses`,
        {
          headers: { 'api-key': this.apiKey }
        }
      );

      console.log('📖 API Response sample:', JSON.stringify(response.data.data[0], null, 2));

      // Map the verses with proper verse numbers from the API
      const verses = response.data.data
        .map((verse: any) => {
          // Extract verse number from the verse ID (format: "GEN.1.1")
          const verseId = verse.id;
          const verseNumber = parseInt(verseId.split('.').pop() || '0');
          
          // Handle different possible text fields
          const text = verse.content || verse.text || verse.orgId || '';
          
          if (!text || !verseNumber) {
            console.warn('⚠️ Skipping invalid verse:', { verseId, hasText: !!text, verseNumber });
            return null;
          }
          
          return {
            number: verseNumber,
            text: text.trim()
          };
        })
        .filter((v: any) => v !== null); // Remove invalid verses

      console.log(`✅ Parsed ${verses.length} verses for ${bookName} ${chapter}`);

      return {
        verses,
        reference: `${bookName} ${chapter}`,
        version
      };
    } catch (error: any) {
      console.error('Error fetching chapter:', error.message);
      console.error('Error details:', error.response?.data || error);
      throw new Error('Failed to fetch chapter from Bible API');
    }
  }

  /**
   * Get a specific verse
   */
  async getVerse(reference: string, version: string = 'WEB'): Promise<BibleVerse> {
    try {
      const bibleId = this.getVersionId(version);
      const response = await axios.get(
        `${this.baseUrl}/bibles/${bibleId}/verses/${reference}`,
        {
          headers: { 'api-key': this.apiKey },
          params: { 'content-type': 'text' }
        }
      );

      const data = response.data.data;
      
      return {
        text: data.content.replace(/<[^>]*>/g, '').trim(), // Strip HTML tags
        reference: data.reference,
        book: data.reference.split(' ')[0],
        chapter: parseInt(data.reference.match(/\d+/)?.[0] || '0'),
        verse: parseInt(data.reference.match(/:(\d+)/)?.[1] || '0'),
        version
      };
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw new Error('Failed to fetch verse from Bible API');
    }
  }

  /**
   * Search for verses
   */
  async searchVerses(query: string, version: string = 'WEB', limit: number = 10): Promise<BibleVerse[]> {
    try {
      const bibleId = this.getVersionId(version);
      const response = await axios.get(
        `${this.baseUrl}/bibles/${bibleId}/search`,
        {
          headers: { 'api-key': this.apiKey },
          params: { 
            query,
            limit,
            'content-type': 'text'
          }
        }
      );

      return response.data.data.verses.map((v: any) => ({
        text: v.text.replace(/<[^>]*>/g, '').trim(),
        reference: v.reference,
        book: v.reference.split(' ')[0],
        chapter: parseInt(v.reference.match(/\d+/)?.[0] || '0'),
        verse: parseInt(v.reference.match(/:(\d+)/)?.[1] || '0'),
        version
      }));
    } catch (error) {
      console.error('Error searching verses:', error);
      throw new Error('Failed to search verses');
    }
  }

  /**
   * Get available Bible versions
   */
  async getAvailableVersions() {
    return [
      { id: 'WEB', name: 'World English Bible', abbreviation: 'WEB' },
      { id: 'KJV', name: 'King James Version', abbreviation: 'KJV' },
      { id: 'ASV', name: 'American Standard Version', abbreviation: 'ASV' },
      { id: 'FBV', name: 'Free Bible Version', abbreviation: 'FBV' }
    ];
  }

  /**
   * Map book name to Bible API book code
   */
  private getBookCode(bookName: string): string {
    const bookMap: { [key: string]: string } = {
      // Old Testament
      'Genesis': 'GEN',
      'Exodus': 'EXO',
      'Leviticus': 'LEV',
      'Numbers': 'NUM',
      'Deuteronomy': 'DEU',
      'Joshua': 'JOS',
      'Judges': 'JDG',
      'Ruth': 'RUT',
      '1 Samuel': '1SA',
      '2 Samuel': '2SA',
      '1 Kings': '1KI',
      '2 Kings': '2KI',
      '1 Chronicles': '1CH',
      '2 Chronicles': '2CH',
      'Ezra': 'EZR',
      'Nehemiah': 'NEH',
      'Esther': 'EST',
      'Job': 'JOB',
      'Psalms': 'PSA',
      'Proverbs': 'PRO',
      'Ecclesiastes': 'ECC',
      'Song of Solomon': 'SNG',
      'Isaiah': 'ISA',
      'Jeremiah': 'JER',
      'Lamentations': 'LAM',
      'Ezekiel': 'EZK',
      'Daniel': 'DAN',
      'Hosea': 'HOS',
      'Joel': 'JOL',
      'Amos': 'AMO',
      'Obadiah': 'OBA',
      'Jonah': 'JON',
      'Micah': 'MIC',
      'Nahum': 'NAM',
      'Habakkuk': 'HAB',
      'Zephaniah': 'ZEP',
      'Haggai': 'HAG',
      'Zechariah': 'ZEC',
      'Malachi': 'MAL',
      // New Testament
      'Matthew': 'MAT',
      'Mark': 'MRK',
      'Luke': 'LUK',
      'John': 'JHN',
      'Acts': 'ACT',
      'Romans': 'ROM',
      '1 Corinthians': '1CO',
      '2 Corinthians': '2CO',
      'Galatians': 'GAL',
      'Ephesians': 'EPH',
      'Philippians': 'PHP',
      'Colossians': 'COL',
      '1 Thessalonians': '1TH',
      '2 Thessalonians': '2TH',
      '1 Timothy': '1TI',
      '2 Timothy': '2TI',
      'Titus': 'TIT',
      'Philemon': 'PHM',
      'Hebrews': 'HEB',
      'James': 'JAS',
      '1 Peter': '1PE',
      '2 Peter': '2PE',
      '1 John': '1JN',
      '2 John': '2JN',
      '3 John': '3JN',
      'Jude': 'JUD',
      'Revelation': 'REV',
    };
    
    return bookMap[bookName] || 'GEN';
  }

  /**
   * Map version abbreviation to Bible API ID
   */
  private getVersionId(version: string): string {
    const versionMap: { [key: string]: string } = {
      'WEB': '9879dbb7cfe39e4d-02',       // World English Bible (Modern, readable)
      'KJV': 'de4e12af7f28f599-02',       // King James Version (Traditional)
      'ASV': '06125adad2d5898a-01',       // American Standard Version (Formal)
      'FBV': '65eec8e0b60e656b-01'        // Free Bible Version (Contemporary)
    };
    
    return versionMap[version.toUpperCase()] || versionMap['WEB'];
  }
}

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  }
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category') || 'world';
    const disabledParam = searchParams.get('disabled');
    const disabledSources = disabledParam ? disabledParam.split(',') : [];

    // Map categories to feed URLs
    const feeds = {
      world: [
        { name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss2.xml', lang: 'he' },
        { name: 'Channel 14', url: 'https://www.now14.co.il/feed/', lang: 'he' },
        { name: 'i24News', url: 'https://www.i24news.tv/he/rss', lang: 'he' },
        { name: 'MSN', url: 'https://www.msn.com/he-il/news/rss', lang: 'he' },
        { name: 'NYTimes', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', lang: 'en' },
        { name: 'Google News', url: 'https://news.google.com/rss?hl=en-IL&gl=IL&ceid=IL:en', lang: 'en' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_world.rss', lang: 'en' },
        { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', lang: 'en' },
        { name: 'TheMarker', url: 'https://www.themarker.com/cmlink/1.144', lang: 'he' },
        { name: 'Calcalist', url: 'https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml', lang: 'he' },
        { name: 'Mako', url: 'https://rcs.mako.co.il/rss/news-israel.xml', lang: 'he' },
        { name: 'Walla', url: 'https://rss.walla.co.il/feed/1', lang: 'he' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/worldnews/.rss', lang: 'en' }
      ],
      tech: [
        { name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss544.xml', lang: 'he' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_technology.rss', lang: 'en' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', lang: 'en' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', lang: 'en' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss', lang: 'en' },
        { name: 'Geektime', url: 'https://www.geektime.co.il/feed/', lang: 'he' },
        { name: 'People & Computers', url: 'https://www.pc.co.il/feed/', lang: 'he' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/technology/.rss', lang: 'en' },
        { name: 'X', url: 'https://nitter.poast.org/search/rss?q=tech', lang: 'en' }
      ],
      startups: [
        { name: 'TechCrunch', url: 'https://techcrunch.com/category/startups/feed/', lang: 'en' },
        { name: 'Geektime', url: 'https://www.geektime.co.il/category/startups/feed/', lang: 'he' },
        { name: 'Calcalist Tech', url: 'https://www.calcalistech.com/GeneralRSS/0,16335,L-3891,00.xml', lang: 'en' },
        { name: 'TheMarker', url: 'https://www.themarker.com/cmlink/1.144', lang: 'he' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/startups/.rss', lang: 'en' }
      ],
      hightech: [
        { name: 'Geektime', url: 'https://www.geektime.co.il/feed/', lang: 'he' },
        { name: 'People & Computers', url: 'https://www.pc.co.il/feed/', lang: 'he' },
        { name: 'Ynet Tech', url: 'https://www.ynet.co.il/Integration/StoryRss544.xml', lang: 'he' },
        { name: 'Wired', url: 'https://www.wired.com/feed/category/business/latest/rss', lang: 'en' },
        { name: 'Walla', url: 'https://rss.walla.co.il/feed/5', lang: 'he' }
      ],
      cyber: [
        { name: 'Wired', url: 'https://www.wired.com/feed/category/security/latest/rss', lang: 'en' },
        { name: 'The Verge', url: 'https://www.theverge.com/cyber-security/rss/index.xml', lang: 'en' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/category/security/feed/', lang: 'en' },
        { name: 'Geektime', url: 'https://www.geektime.co.il/category/information-security/feed/', lang: 'he' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/cybersecurity/.rss', lang: 'en' }
      ],
      ai: [
        { name: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', lang: 'en' },
        { name: 'Wired', url: 'https://www.wired.com/feed/tag/ai/latest/rss', lang: 'en' },
        { name: 'The Verge', url: 'https://www.theverge.com/artificial-intelligence/rss/index.xml', lang: 'en' },
        { name: 'Geektime', url: 'https://www.geektime.co.il/tag/ai/feed/', lang: 'he' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/artificial/.rss', lang: 'en' },
        { name: 'X', url: 'https://nitter.poast.org/search/rss?q=artificial+intelligence', lang: 'en' }
      ],
      future: [
        { name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss2287.xml', lang: 'he' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_space.rss', lang: 'en' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss', lang: 'en' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', lang: 'en' }
      ],
      lifestyle: [
        { name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss3254.xml', lang: 'he' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_entertainment.rss', lang: 'en' },
        { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', lang: 'en' }
      ],
      infosec: [
        { name: 'Wired', url: 'https://www.wired.com/feed/category/security/latest/rss', lang: 'en' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/category/security/feed/', lang: 'en' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/cybersecurity/.rss', lang: 'en' }
      ],
      economy: [
        { name: 'Calcalist', url: 'https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml', lang: 'he' },
        { name: 'TheMarker', url: 'https://www.themarker.com/cmlink/1.144', lang: 'he' },
        { name: 'Business Insider', url: 'https://feeds.businessinsider.com/custom/all', lang: 'en' },
        { name: 'Forbes', url: 'https://www.forbes.com/business/feed/', lang: 'en' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/economy/.rss', lang: 'en' }
      ],
      ev: [
        { name: 'Electrek', url: 'https://electrek.co/feed/', lang: 'en' },
        { name: 'InsideEVs', url: 'https://insideevs.com/rss/articles/all/', lang: 'en' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/electricvehicles/.rss', lang: 'en' }
      ],
      autotech: [
        { name: 'TechCrunch', url: 'https://techcrunch.com/category/transportation/feed/', lang: 'en' },
        { name: 'The Verge', url: 'https://www.theverge.com/transportation/rss/index.xml', lang: 'en' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/SelfDrivingCars/.rss', lang: 'en' }
      ],
      gaming: [
        { name: 'IGN', url: 'https://m.ign.com/rss/articles/games', lang: 'en' },
        { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', lang: 'en' },
        { name: 'Kotaku', url: 'https://kotaku.com/rss', lang: 'en' },
        { name: 'Vgames', url: 'https://www.vgames.co.il/rss', lang: 'he' },
        { name: 'Reddit', url: 'https://www.reddit.com/r/gaming/.rss', lang: 'en' }
      ]
    };

    const categories = categoryParam.split(',');
    let targetFeeds = [];
    categories.forEach(cat => {
      if (feeds[cat]) {
        targetFeeds = [...targetFeeds, ...feeds[cat]];
      }
    });

    // Filter out disabled sources
    if (disabledSources.length > 0) {
      targetFeeds = targetFeeds.filter(source => !disabledSources.includes(source.name));
    }

    // Deduplicate feeds by url
    const uniqueFeedsMap = new Map();
    targetFeeds.forEach(feed => uniqueFeedsMap.set(feed.url, feed));
    targetFeeds = Array.from(uniqueFeedsMap.values());

    // Fetch all feeds concurrently
    const feedPromises = targetFeeds.map(source => 
      parser.parseURL(source.url)
        .then(feed => ({ source: source.name, lang: source.lang, items: feed.items || [] }))
        .catch(e => ({ source: source.name, lang: source.lang, items: [], error: true }))
    );

    const feedResults = await Promise.all(feedPromises);

    const extractImage = (item) => {
      if (item.enclosure && item.enclosure.url) return item.enclosure.url;
      if (item['media:content'] && item['media:content'].$) return item['media:content'].$.url;
      const content = item.content || item.contentSnippet || '';
      const imgMatch = content.match(/<img[^>]+src="?([^"\s]+)"?/);
      if (imgMatch) return imgMatch[1];
      return null;
    };

    const fallbackImages = [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop"
    ];

    let globalIndex = 0;
    
    // Flatten and format all articles
    let allArticles = [];
    
    // To ensure a mix of sources regardless of date (since some dates are old), 
    // we'll take the top 15 from each successful source and mix them.
    for (const result of feedResults) {
      if (!result.error && result.items.length > 0) {
        const topItems = result.items.slice(0, 15).map((item) => {
          const img = extractImage(item) || fallbackImages[globalIndex % fallbackImages.length];
          globalIndex++;
          return {
            id: item.guid || item.id || item.link,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet || item.content,
            content: item.content || '',
            author: item.creator || item.author || '',
            categories: item.categories || [],
            image: img,
            source: result.source,
            lang: result.lang
          };
        });
        allArticles = [...allArticles, ...topItems];
      }
    }

    // Filter articles to be within the last month and not too far in the future
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + 1);

    allArticles = allArticles.filter(a => {
      if (!a.pubDate) return false;
      const pub = new Date(a.pubDate);
      // Ensure date is valid and within range
      return !isNaN(pub.getTime()) && pub >= oneMonthAgo && pub <= futureLimit;
    });

    // Sort the articles by newest publication date
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(
      { articles: allArticles },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

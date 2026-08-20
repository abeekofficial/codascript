import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codascript.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/learn'],
      disallow: ['/dashboard', '/admin', '/login', '/api/', '/quiz/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

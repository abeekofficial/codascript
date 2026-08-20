import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codascript.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  // Static routes
  const routes = [
    '',
    '/learn',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic topic routes
  try {
    const res = await fetch(`${apiUrl}/questions/topics`, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      const topics = data.data as string[];
      
      const topicRoutes = topics.map((topic) => ({
        url: `${baseUrl}/learn/${topic.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      
      return [...routes, ...topicRoutes];
    }
  } catch (error) {
    console.error("Sitemap: Failed to fetch topics", error);
  }

  return routes;
}

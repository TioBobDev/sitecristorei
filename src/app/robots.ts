import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/associado/'],
    },
    sitemap: 'https://sitecristorei.org/sitemap.xml',
  };
}

import { defaultSEO } from '../seoConfig';

export interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  authorName: string;
  publishedAt?: string;
  modifiedAt?: string;
}

export const createArticleSchema = ({
  title,
  description,
  url,
  image,
  authorName,
  publishedAt,
  modifiedAt,
}: ArticleSchemaProps): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  image: image || defaultSEO.image,
  author: {
    '@type': 'Person',
    name: authorName,
  },
  publisher: {
    '@type': 'Organization',
    name: defaultSEO.siteName,
    logo: {
      '@type': 'ImageObject',
      url: `${defaultSEO.siteUrl}/logo192.png`,
    },
  },
  url: `${defaultSEO.siteUrl}${url}`,
  datePublished: publishedAt,
  dateModified: modifiedAt || publishedAt,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${defaultSEO.siteUrl}${url}`,
  },
});

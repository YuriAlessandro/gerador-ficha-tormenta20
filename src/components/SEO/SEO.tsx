import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG } from './seoConfig';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = SEO_CONFIG.defaults.description,
  image = SEO_CONFIG.defaultImage,
  url,
  type = 'website',
  author,
  publishedAt,
  modifiedAt,
  noindex = false,
  structuredData,
}) => {
  const fullTitle = title
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.defaults.title;

  const fullUrl = url ? `${SEO_CONFIG.baseUrl}${url}` : SEO_CONFIG.baseUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      {noindex && <meta name='robots' content='noindex, nofollow' />}

      {/* Open Graph */}
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:url' content={fullUrl} />
      <meta property='og:type' content={type} />
      <meta property='og:site_name' content={SEO_CONFIG.siteName} />
      <meta property='og:locale' content={SEO_CONFIG.locale} />

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />

      {/* Article-specific (for blog posts) */}
      {type === 'article' && author && (
        <meta property='article:author' content={author} />
      )}
      {type === 'article' && publishedAt && (
        <meta property='article:published_time' content={publishedAt} />
      )}
      {type === 'article' && modifiedAt && (
        <meta property='article:modified_time' content={modifiedAt} />
      )}

      {/* Canonical URL */}
      <link rel='canonical' href={fullUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type='application/ld+json'>
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

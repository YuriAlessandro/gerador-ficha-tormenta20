import { defaultSEO } from '../seoConfig';

export interface ProfileSchemaProps {
  name: string;
  username: string;
  description?: string;
  image?: string;
  url: string;
}

export const createProfileSchema = ({
  name,
  username,
  description,
  image,
  url,
}: ProfileSchemaProps): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name,
  alternateName: `@${username}`,
  description: description || `Perfil de ${name} no ${defaultSEO.siteName}.`,
  image: image || undefined,
  url: `${defaultSEO.siteUrl}${url}`,
  sameAs: [`${defaultSEO.siteUrl}${url}`],
  memberOf: {
    '@type': 'Organization',
    name: defaultSEO.siteName,
    url: defaultSEO.siteUrl,
  },
});

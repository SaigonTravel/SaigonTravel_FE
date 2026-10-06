import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/hooks/queries';
import { DEFAULT_LOGO } from '@/utils/format';

export function Seo({ title, description, image }: { title?: string; description?: string; image?: string }) {
  const { data: settings } = useSettings();
  const siteName = settings?.companyName || 'Saigon Travel';
  const fullTitle = title ? `${title} | ${siteName}` : settings?.seoDefault?.metaTitle || siteName;
  const desc = description || settings?.seoDefault?.metaDescription || '';
  const og = image || settings?.seoDefault?.ogImage;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      {og && <meta property="og:image" content={og} />}
      <link rel="icon" href={settings?.favicon || settings?.logo || DEFAULT_LOGO} />
    </Helmet>
  );
}

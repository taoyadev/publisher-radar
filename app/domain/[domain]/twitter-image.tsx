import { ImageResponse } from 'next/og';
import { safeDecodeURIComponent } from '@/lib/url';

export const runtime = 'edge';
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const decodedDomain = safeDecodeURIComponent(domain);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: 64,
          background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 65%, #111827 100%)',
          color: '#FFFFFF',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 22, opacity: 0.9 }}>Publisher Radar</div>
          <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: -1 }}>{decodedDomain}</div>
          <div style={{ fontSize: 24, opacity: 0.95 }}>AdSense domain profile</div>
        </div>
      </div>
    ),
    size
  );
}


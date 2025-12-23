import { ImageResponse } from 'next/og';
import { safeDecodeURIComponent } from '@/lib/url';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publisherId = safeDecodeURIComponent(id);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 45%, #111827 100%)',
          color: '#FFFFFF',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 24, opacity: 0.9 }}>AdSense Publisher Profile</div>
          <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
            {publisherId}
          </div>
          <div style={{ fontSize: 22, opacity: 0.95 }}>
            Verified domains, seller type, and history from sellers.json
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
          <div style={{ fontSize: 20 }}>Publisher Radar</div>
          <div style={{ fontSize: 18 }}>publisherradar.com</div>
        </div>
      </div>
    ),
    size
  );
}


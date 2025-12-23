import { ImageResponse } from 'next/og';
import { safeDecodeURIComponent } from '@/lib/url';

export const runtime = 'edge';
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';

export default async function TwitterImage({
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
          alignItems: 'center',
          padding: 64,
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 75%, #111827 100%)',
          color: '#FFFFFF',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 22, opacity: 0.9 }}>Publisher Radar</div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>{publisherId}</div>
          <div style={{ fontSize: 24, opacity: 0.95 }}>
            AdSense publisher profile from sellers.json
          </div>
        </div>
      </div>
    ),
    size
  );
}


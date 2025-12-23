import { ImageResponse } from 'next/og';
import { safeDecodeURIComponent } from '@/lib/url';

export const runtime = 'edge';
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ tld: string }>;
}) {
  const { tld } = await params;
  const tldLower = safeDecodeURIComponent(tld).toLowerCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: 64,
          background: 'linear-gradient(135deg, #F97316 0%, #2563EB 70%, #111827 100%)',
          color: '#FFFFFF',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 22, opacity: 0.9 }}>Publisher Radar</div>
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>.{tldLower}</div>
          <div style={{ fontSize: 24, opacity: 0.95 }}>TLD directory</div>
        </div>
      </div>
    ),
    size
  );
}


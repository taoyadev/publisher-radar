import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/config/site';

export const runtime = 'edge';
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: 64,
          background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 70%, #111827 100%)',
          color: '#FFFFFF',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>
            {SITE_CONFIG.name}
          </div>
          <div style={{ fontSize: 26, opacity: 0.95, maxWidth: 980, lineHeight: 1.25 }}>
            1M+ verified AdSense publishers • Search by pub-id, domain, or name
          </div>
        </div>
      </div>
    ),
    size
  );
}


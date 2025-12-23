import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/config/site';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
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
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 55%, #111827 100%)',
          color: '#FFFFFF',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>
            {SITE_CONFIG.name}
          </div>
          <div style={{ fontSize: 28, opacity: 0.95, maxWidth: 960, lineHeight: 1.25 }}>
            Search and analyze 1M+ Google AdSense publishers from sellers.json
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            opacity: 0.95,
          }}
        >
          <div style={{ fontSize: 22 }}>publisherradar.com</div>
          <div style={{ fontSize: 18, opacity: 0.9 }}>Updated daily</div>
        </div>
      </div>
    ),
    size
  );
}


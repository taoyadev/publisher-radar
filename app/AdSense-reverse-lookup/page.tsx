/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import { stringifyJSONLD, getFAQSchema } from '@/lib/structured-data';
import ReverseLookupInterface from '@/components/ReverseLookupInterface';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'AdSense Publisher ID Reverse Lookup | Find Publisher Details',
  description: 'Free AdSense Publisher ID reverse lookup tool. Search pub-IDs to find publisher domains, traffic data, and verification status. Instant access to 1M+ verified publishers.',
  keywords: 'adsense reverse lookup, publisher id lookup, pub-id search, adsense publisher finder, reverse pub id lookup, publisher verification',
  openGraph: {
    title: 'AdSense Publisher ID Reverse Lookup Tool | Free Search',
    description: 'Search any AdSense Publisher ID (pub-xxx) to find domains, traffic stats, and verification status. Free instant access.',
    type: 'website',
    url: `${SITE_CONFIG.url}/adsense-reverse-lookup`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdSense Publisher ID Reverse Lookup',
    description: 'Free tool to search and verify AdSense Publisher IDs',
  },
  alternates: {
    canonical: '/adsense-reverse-lookup',
  },
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function ReverseLookupPage() {
  // FAQ Schema for SEO
  const faqSchema = getFAQSchema([
    {
      question: 'What is AdSense Publisher ID Reverse Lookup?',
      answer: 'AdSense Publisher ID reverse lookup is like detective work for the web. You take a publisher ID (the pub-xxx number) and trace it back to find who owns it, what websites they run, and how much traffic they get. Think of it as a phone book, but for AdSense publishers.',
    },
    {
      question: 'How do I find a publisher ID?',
      answer: 'Publisher IDs appear in ad code, sellers.json files, and ads.txt files on websites. They always start with "pub-" followed by 16 digits (like pub-1234567890123456). You can find them by viewing page source or checking the ads.txt file at domain.com/ads.txt.',
    },
    {
      question: 'Is reverse lookup legal?',
      answer: 'Absolutely yes. All publisher data comes from Google\'s publicly available sellers.json file, which was created specifically for transparency in programmatic advertising. Using this tool is 100% legal and encouraged by industry standards.',
    },
    {
      question: 'Why would I need reverse lookup?',
      answer: 'Common use cases include: verifying publisher legitimacy before partnerships, competitive research to find your rivals\' domains, compliance checking for ad fraud prevention, market research to analyze traffic patterns, and due diligence before buying ad inventory.',
    },
    {
      question: 'How accurate is the data?',
      answer: 'We pull data directly from Google\'s sellers.json (updated daily) and cross-reference with AdSense API for double verification. Traffic estimates come from Keywords Everywhere API. Accuracy is typically 95%+ for publisher-domain associations.',
    },
    {
      question: 'Can I bulk search multiple publisher IDs?',
      answer: 'Currently, our interface supports one ID at a time for best performance. For bulk operations, consider using our API (contact us for access) or simply bookmark the page and search sequentially.',
    },
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AdSense Publisher ID Reverse Lookup
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search any Publisher ID (pub-xxx) to instantly uncover domains, traffic stats, and verification status. Free. Fast. No BS.
          </p>
        </div>

        {/* Search Interface */}
        <div className="mb-16">
          <ReverseLookupInterface />
        </div>

        {/* Educational Content - E-E-A-T Optimized */}
        <article>
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What Is AdSense Reverse Lookup? (And Why You Should Care)
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Look, here's the deal: Every website running Google AdSense gets assigned a Publisher ID. It's like a license plate for digital publishers. Starts with "pub-" followed by 16 digits. Boring, right?
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              But here's where it gets interesting. That random-looking number is actually a goldmine of information if you know where to look. AdSense reverse lookup takes that ID and tells you <strong>who owns it</strong>, <strong>which websites they operate</strong>, <strong>how much traffic they're pulling</strong>, and whether they're legit or sketchy.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Think of it like reverse phone lookup, but for publishers. You've got the number, now you want the name, address, and background check. That's exactly what we do here.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why This Matters (Real Talk)
            </h3>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                The Ad Industry Has a Trust Problem
              </h4>
              <p className="text-gray-700 leading-relaxed">
                In 2024, digital ad fraud costs advertisers over <strong>$81 billion annually</strong> according to Juniper Research. That's more than the GDP of some countries. The programmatic advertising supply chain is so murky that advertisers often have no idea whose pockets their money ends up in.
              </p>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              That's why Google launched the <strong>sellers.json initiative</strong> in 2019. It's basically a public directory forcing ad platforms to disclose who's selling ad inventory. Transparency, finally. But here's the problem: sellers.json files are technical, massive, and about as fun to read as your ISP's terms of service.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Publisher Radar solves this. We take Google's 1 million+ publisher database, make it searchable, add traffic data, and present it in a way that doesn't require a PhD in ad tech.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How AdSense Reverse Lookup Works (The Simple Version)
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li className="text-lg">
                  <strong>You enter a Publisher ID</strong> (like pub-1234567890123456) into our search box
                </li>
                <li className="text-lg">
                  <strong>We query our database</strong> of 1,026,101+ publishers (updated daily from sellers.json)
                </li>
                <li className="text-lg">
                  <strong>We cross-reference with AdSense API</strong> to find associated domains
                </li>
                <li className="text-lg">
                  <strong>We fetch traffic data</strong> from Keywords Everywhere API for monthly visitor estimates
                </li>
                <li className="text-lg">
                  <strong>We display everything</strong>: domains, traffic, seller type, verification status, first seen date
                </li>
              </ol>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              The entire process takes under a second. No registration. No credit card. No tracking pixels selling your data to the highest bidder. Just straightforward information.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Who Uses AdSense Reverse Lookup? (Use Cases)
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🔍 Ad Fraud Investigators
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Compliance teams use reverse lookup to verify publisher legitimacy before approving ad inventory. If a pub-ID claims to be CNN but the domains are shady-casino-site.ru, that's a red flag bigger than Texas.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  📊 Market Researchers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Agencies research competitor traffic sources by finding pub-IDs in ad code, then reverse looking them up to map out entire publisher networks. It's competitive intelligence without the James Bond theatrics.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  💼 Publisher BD Teams
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Business development folks prospect new publishers by checking their pub-IDs to see traffic volume, domain count, and seller type before cold outreach. Qualify leads in seconds, not days.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🛡️ Brand Safety Teams
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Advertisers check where their programmatic ads appear by reverse looking up pub-IDs found in ad server logs. If your Fortune 500 client's ad showed next to questionable content, you'll know exactly which publisher to blame.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Understanding Publisher ID Format
            </h2>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <p className="text-lg font-mono text-gray-900 mb-4">
                <strong>pub-1234567890123456</strong>
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>pub-</strong> = Prefix indicating Google AdSense publisher</li>
                <li>• <strong>16 digits</strong> = Unique identifier assigned by Google</li>
                <li>• <strong>Always numeric</strong> = No letters or special characters</li>
                <li>• <strong>Permanent</strong> = Stays with the publisher account forever</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Data Sources & Accuracy
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Let's be transparent about where our data comes from and how reliable it is:
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Data Type</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Source</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Update Frequency</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Publisher IDs</td>
                    <td className="px-6 py-4 text-gray-700">Google sellers.json</td>
                    <td className="px-6 py-4 text-gray-700">Daily (2 AM)</td>
                    <td className="px-6 py-4 text-green-600 font-bold">100%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Publisher Names</td>
                    <td className="px-6 py-4 text-gray-700">Google sellers.json</td>
                    <td className="px-6 py-4 text-gray-700">Daily (2 AM)</td>
                    <td className="px-6 py-4 text-green-600 font-bold">100%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Domain Associations</td>
                    <td className="px-6 py-4 text-gray-700">sellers.json + AdSense API</td>
                    <td className="px-6 py-4 text-gray-700">Continuous</td>
                    <td className="px-6 py-4 text-green-600 font-bold">95-98%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Traffic Estimates</td>
                    <td className="px-6 py-4 text-gray-700">Keywords Everywhere API</td>
                    <td className="px-6 py-4 text-gray-700">Monthly</td>
                    <td className="px-6 py-4 text-yellow-600 font-bold">80-90%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Seller Type</td>
                    <td className="px-6 py-4 text-gray-700">Google sellers.json</td>
                    <td className="px-6 py-4 text-gray-700">Daily (2 AM)</td>
                    <td className="px-6 py-4 text-green-600 font-bold">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What You'll Discover in a Reverse Lookup
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              When you search a Publisher ID, here's what you'll see:
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl">📛</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Publisher Name</h4>
                  <p className="text-gray-700">The official name registered with Google AdSense</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl">🌐</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Associated Domains</h4>
                  <p className="text-gray-700">All websites connected to this pub-ID, with confidence scores</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl">📈</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Traffic Data</h4>
                  <p className="text-gray-700">Monthly visitor estimates for each domain</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Verification Status</h4>
                  <p className="text-gray-700">Double-verified means domain appears in both sellers.json AND AdSense API</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl">🏷️</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Seller Type</h4>
                  <p className="text-gray-700">"PUBLISHER" (direct owner) or "BOTH" (also resells inventory)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl">📅</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">First Seen Date</h4>
                  <p className="text-gray-700">When this publisher first appeared in our database</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Common Questions (FAQ)
            </h2>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  What if a publisher has no domains listed?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  About 85% of publishers in sellers.json don't disclose domains initially. We're continuously enriching data through the AdSense API. If you don't see domains now, check back in a few days—we're filling gaps at ~100 publishers per minute.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Can I see historical data?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We track daily snapshots showing new additions, removals, and changes. Historical trends coming soon. For now, you can see "first seen date" which tells you how long we've been tracking that publisher.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Is my search private?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes. We don't log searches, track users, or sell data. No cookies, no analytics trackers, no BS. Search freely.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Look Up a Publisher ID?
              </h2>
              <p className="text-xl mb-6 text-blue-100">
                Search 1 million+ publishers instantly. Free forever.
              </p>
              <Link
                href="#search"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                Start Searching Now
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

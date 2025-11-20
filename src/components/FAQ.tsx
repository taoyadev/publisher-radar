export default function FAQ() {
  const faqs = [
    {
      question: 'What is sellers.json?',
      answer: 'Sellers.json is a standardized file published by ad exchanges and SSPs (like Google AdSense) that lists all authorized sellers of their advertising inventory. Think of it like a phonebook for the ad tech industry—it tells you who\'s allowed to sell ads on Google\'s network. The IAB Tech Lab created this standard in 2019 to bring transparency to programmatic advertising and combat fraud. Before sellers.json, nobody really knew who was selling what ad inventory, which made it easy for scammers to pose as legitimate publishers. Now, every publisher gets a unique ID (like pub-1234567890) and can optionally list their domains. This transparency protects both advertisers and legitimate publishers from fraud.',
    },
    {
      question: 'How often is the data updated?',
      answer: 'Our database automatically synchronizes with Google\'s official sellers.json file every single day at 2:00 AM. We download the latest version (it\'s about 110MB), parse it, compare it with our existing database, and update everything—new publishers, removed publishers, domain changes, the works. We also run AdSense API enrichment continuously to fill in missing domain information for publishers that don\'t have it in sellers.json. So you\'re always looking at data that\'s less than 24 hours old. We track daily snapshots too, so you can see historical trends and growth patterns over time. Fresh data matters when you\'re making advertising decisions.',
    },
    {
      question: 'What does "PUBLISHER" vs "BOTH" mean?',
      answer: 'PUBLISHER means the entity owns and operates the website where ads appear—they\'re the actual content creator. BOTH means the entity does two things: they own some sites AND they operate as an intermediary reselling other publishers\' ad inventory. This distinction is crucial for supply chain transparency. If you\'re working with a PUBLISHER, you know you\'re dealing directly with the content owner. If it says BOTH, they might be reselling space on sites they don\'t actually own, which adds another layer to the supply chain. Neither is inherently bad, but you need to know which is which. It affects pricing, quality control, and compliance. Always check this field when vetting potential publisher partnerships.',
    },
    {
      question: 'Where does the traffic data come from?',
      answer: 'Traffic estimates come from two primary sources: Keywords Everywhere API and Google\'s AdSense API. Keywords Everywhere provides monthly search traffic estimates based on their extensive search data. The AdSense API sometimes includes traffic data when we query for domain information. We display whichever source has the most recent or reliable data. Important caveat: not all publishers have traffic data available. Smaller, newer, or more private publishers often won\'t have traffic estimates because they don\'t generate enough search traffic to be tracked reliably. When you see N/A for traffic, it doesn\'t necessarily mean the site has zero traffic—it just means we don\'t have reliable data for it yet. Focus on publishers with traffic data when volume matters.',
    },
    {
      question: 'Can I use this data for commercial purposes?',
      answer: 'Absolutely, yes. Google\'s sellers.json file is publicly available specifically for transparency purposes—anyone can download and use it. We\'ve simply made it way easier to work with by building this searchable database. You can use this data for compliance checking (verifying publishers are legit), market research (understanding the competitive landscape), competitor analysis (finding where competitors advertise), partnership due diligence (vetting publishers before deals), and fraud detection (spotting domain spoofing). All of that is legitimate business use. The whole point of sellers.json is to make the advertising supply chain transparent, so Google expects people to use this data commercially. Just don\'t scrape our API aggressively or try to resell our interface—use the data itself as much as you want.',
    },
    {
      question: 'How do I find a specific publisher?',
      answer: 'Use the search bar on our homepage—it accepts three types of searches. First, you can search by Publisher ID (like pub-1234567890) for exact matches. Second, you can search by domain name (like example.com) to find which publisher owns that domain. Third, you can search by publisher name if they\'ve registered one. The search is debounced and returns results in real-time. If you\'re browsing rather than searching, you can use our directory pages sorted by traffic, domain count, or recent additions. We also have TLD-specific pages (like /tld/com) if you want to browse publishers by domain extension. And our daily snapshot pages (/new/YYYY-MM-DD) show publishers added on specific dates. Multiple ways to slice the data depending on what you need.',
    },
    {
      question: 'What is "double verification"?',
      answer: 'Domains marked as double verified appear in both Google\'s sellers.json file AND their AdSense API responses—meaning Google confirmed that domain-to-publisher connection through two separate systems. This is the gold standard for verification. It means there\'s zero ambiguity about whether that domain belongs to that publisher. We assign a 100% confidence score to double-verified domains. If a domain only appears in one source (usually the AdSense API), we still show it but with a 95% confidence score. Double verification matters most when you\'re doing fraud detection or compliance work where you need absolute certainty. For general research and prospecting, 95% confidence is usually fine. But when money or legal compliance is on the line, look for that 100% double verification.',
    },
    {
      question: 'Why do some publishers have no domains listed?',
      answer: 'About 85% of publishers in Google\'s sellers.json file initially have no domain information—just a publisher ID and maybe a name. That\'s because Google doesn\'t require publishers to disclose their domains in sellers.json; it\'s optional. Some publishers keep their domains confidential for competitive reasons. Others just haven\'t bothered to add them. That\'s where our enrichment process comes in. We query the AdSense API for every publisher to try to find their domains. It\'s a massive operation (880,000+ API calls), and we run it continuously. Every day, more publishers get domain data added. If you see a publisher with zero domains today, check back in a week—we might have enriched it by then. This is one of our key value-adds beyond just hosting sellers.json.',
    },
    {
      question: 'How do I identify fraudulent publishers?',
      answer: 'Look for these red flags: (1) Publisher has domains listed, but the domains you\'re seeing ads on aren\'t in that list—that\'s potential domain spoofing. (2) Publisher has zero domains and zero traffic data despite claiming to be established—could be fake. (3) Mismatched names—publisher name doesn\'t match the domain names at all, which suggests reselling or fraud. (4) Confidence scores below 80%—means the domain association is weak or unverified. (5) Seller type is BOTH but they have tons of unrelated domains—likely an intermediary reselling others\' inventory without clear disclosure. Cross-reference everything: check the publisher ID matches the domains, verify traffic numbers make sense, and watch for inconsistencies. If something feels off, it probably is. Trust your instincts and our confidence scores.',
    },
    {
      question: 'What\'s a "good" domain count for a publisher?',
      answer: 'Context matters, but here\'s the general pattern: Most legitimate individual publishers operate 1-5 domains. Media companies or larger publishers might run 10-30 domains across different properties or niches. Publisher networks or intermediaries often have 50+ domains. If you see someone with 200+ domains and seller type PUBLISHER (not BOTH), that\'s unusual—investigate further. High domain counts aren\'t inherently bad, but they should match the publisher\'s business model. A small blog shouldn\'t have 100 domains. A major media company should. The average across our database is around 0.14 domains per publisher, but that\'s skewed by the 85% who have zero domains listed initially. Focus on the domains-to-traffic ratio: legitimate publishers with high traffic usually have fewer, high-quality domains. Lots of domains with little traffic? Red flag.',
    },
    {
      question: 'Can I track my competitors\' publisher networks?',
      answer: 'Absolutely. Here\'s how: Find a domain where you\'ve seen your competitor\'s ads. Search that domain in our database to find the publisher ID. Click through to see all other domains that publisher operates. Boom—you just found your competitor\'s entire network on that publisher. Do this across multiple domains where you\'ve spotted competitor ads, and you\'ll map out their publisher relationships. You can also sort our directory by traffic to find the highest-traffic publishers and check if your competitors are likely advertising there. This competitive intelligence is 100% legal because all this data is publicly available from Google. We\'re just making it searchable. Use this intel to approach the same publishers, find similar alternatives, or identify gaps in your competitor\'s strategy. Knowledge is power.',
    },
    {
      question: 'What traffic threshold indicates a serious publisher?',
      answer: 'Based on our data, here\'s the breakdown: 100K+ monthly visits = legitimate, established publisher worth considering. 1M+ monthly visits = serious publisher with proven audience, usually safe bet for partnerships. 10M+ monthly visits = elite tier publisher, major media property with premium pricing. Below 100K? Could be emerging (good opportunity) or just small-scale (higher risk). Zero traffic data doesn\'t automatically disqualify a publisher—it might just mean we haven\'t captured their data yet, or they\'re in a niche that doesn\'t generate search traffic. But if you\'re looking for safe, proven publishers with real audiences, start your search at the 100K+ level and work up from there. Use our traffic sorting feature to filter by volume. Don\'t just chase the biggest numbers though—mid-tier publishers (100K-1M range) often offer better ROI and less competition.',
    },
  ];

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Everything you need to know about AdSense Publisher Radar
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
          >
            <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>{faq.question}</span>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 text-center bg-blue-50 border border-blue-200 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Have more questions?
        </h3>
        <p className="text-gray-600 mb-4">
          We're here to help you make the most of Publisher Radar
        </p>
        <a
          href="mailto:support@example.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Support
        </a>
      </div>
    </section>
  );
}

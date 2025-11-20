export default function UseCases() {
  const useCases = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Publisher ID Reverse Lookup',
      description: 'Ever see a "pub-1234567890" in your ad reports and wonder who the hell that is? We get it. Paste that Publisher ID into our search and instantly see every domain they operate, their traffic numbers, and whether they\'re legit. Takes 2 seconds. We\'ve processed millions of these lookups for marketers like you who need answers fast, not hours of digging through JSON files.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Domain Verification',
      description: 'See a domain running ads and need to verify who owns the AdSense account? Search the domain here. You\'ll see the publisher ID, traffic estimates, and confidence scores. This is crucial for spotting domain spoofing—where scammers pretend to be legitimate publishers. If the domain isn\'t listed under that publisher ID, that\'s a red flag. Simple as that.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Traffic Insights',
      description: 'Stop guessing which publishers are worth your time. Our database shows real monthly traffic estimates sourced from Keywords Everywhere and AdSense APIs. Sort by traffic to find publishers getting millions of monthly visitors. Whether you\'re looking for partnership opportunities or scoping out the competition, traffic numbers tell you who actually has an audience worth advertising to.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Daily Monitoring',
      description: 'Google adds new publishers to sellers.json every single day. We track them all, automatically. Check our daily snapshot pages to see who joined yesterday, last week, or last month. This is how you spot emerging publishers before they blow up—and before your competitors find them. Early access = better deals and first-mover advantage in new niches.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: 'TLD Analysis',
      description: 'Want to understand domain distribution patterns? Browse publishers by top-level domain—.com, .org, .net, .blog, whatever. You\'ll see how many publishers operate each TLD and their traffic profiles. Super useful for niche research. For example, .blog domains might indicate content-heavy publishers, while .com suggests established businesses. Patterns matter.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Compliance Checking',
      description: 'Need to verify publisher authenticity for compliance or due diligence? Check seller types (PUBLISHER vs BOTH) to understand if they\'re selling their own inventory or acting as intermediaries reselling others\' ad space. PUBLISHER means they own the content. BOTH means they\'re also resellers. This distinction matters for supply chain transparency and regulatory compliance in programmatic advertising.',
    },
  ];

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          How to Use Publisher Radar
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Powerful tools for publishers, advertisers, and ad tech professionals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {useCases.map((useCase, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              {useCase.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {useCase.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

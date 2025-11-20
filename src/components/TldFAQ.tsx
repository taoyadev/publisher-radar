'use client';

import { useState } from 'react';

interface TldFAQProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  tld: string;
}

export default function TldFAQ({ faqs, tld }: TldFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First FAQ open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Frequently Asked Questions about .{tld} Domains
        </h2>
        <p className="text-gray-600">
          Common questions about .{tld} domains and AdSense publishers
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between gap-4"
              aria-expanded={openIndex === index}
            >
              <span className="font-semibold text-gray-900 flex-1">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openIndex === index && (
              <div className="px-6 py-4 bg-white border-t border-gray-200 animate-fade-in">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-8 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-600 mb-4">
          Have more questions about .{tld} publishers?
        </p>
        <p className="text-sm text-gray-500">
          Our data is sourced directly from Google's sellers.json and updated daily.
          All publishers are verified through official AdSense records.
        </p>
      </div>
    </section>
  );
}

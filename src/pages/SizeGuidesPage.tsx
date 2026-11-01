import React, { useState } from 'react';
import { Ruler, Sparkles, CheckCircle2 } from 'lucide-react';

export const SizeGuidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ring' | 'chain' | 'kada'>('ring');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
          Sizing &amp; Fitting Advice
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 font-normal">
          Jewellery Size Guides
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Because we operate on a strict <strong>No-Return / No-Refund policy</strong>, we encourage you to measure your finger, wrist, or desired chain length accurately before purchasing!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 rounded-2xl p-1.5 max-w-lg mx-auto">
        {[
          { id: 'ring', label: 'Ring Size Chart' },
          { id: 'chain', label: 'Chain Lengths' },
          { id: 'kada', label: 'Kadas & Bracelets' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-stone-800 text-pink-600 dark:text-pink-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white dark:bg-stone-900 p-6 sm:p-10 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-sm space-y-8">
        {activeTab === 'ring' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-stone-100 font-normal">
              Ring Size Chart (US &amp; Indian Sizes)
            </h3>

            <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-pink-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 uppercase font-semibold">
                  <tr>
                    <th className="p-3">US Size</th>
                    <th className="p-3">Inner Diameter (mm)</th>
                    <th className="p-3">Finger Circumference (mm)</th>
                    <th className="p-3">Indian Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {[
                    { us: 'US 5', dia: '15.7 mm', circ: '49.3 mm', ind: '10' },
                    { us: 'US 6', dia: '16.5 mm', circ: '51.9 mm', ind: '12' },
                    { us: 'US 7', dia: '17.3 mm', circ: '54.4 mm', ind: '14' },
                    { us: 'US 8', dia: '18.1 mm', circ: '57.0 mm', ind: '16 - 17' },
                    { us: 'US 9', dia: '18.9 mm', circ: '59.5 mm', ind: '19' },
                    { us: 'US 10', dia: '19.8 mm', circ: '62.1 mm', ind: '21 - 22' },
                    { us: 'US 11', dia: '20.6 mm', circ: '64.6 mm', ind: '24' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-pink-50/30">
                      <td className="p-3 font-bold text-pink-600 dark:text-pink-400">{row.us}</td>
                      <td className="p-3">{row.dia}</td>
                      <td className="p-3">{row.circ}</td>
                      <td className="p-3 font-medium">{row.ind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-stone-800/60 border border-pink-100 dark:border-stone-800 space-y-2 text-xs text-stone-700 dark:text-stone-300">
              <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                How to measure your ring size at home:
              </p>
              <p>1. Cut a paper strip about 10cm long and 0.5cm wide.</p>
              <p>2. Wrap it snugly around the base of your desired finger without pulling too tightly.</p>
              <p>3. Mark where the paper overlaps with a pencil or pen.</p>
              <p>4. Measure the length with a standard ruler in millimeters (mm) and find your circumference above!</p>
            </div>
          </div>
        )}

        {activeTab === 'chain' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-stone-100 font-normal">
              Chain &amp; Necklace Length Placements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { len: '16 inches (40 cm)', pos: 'Choker style / sits tightly on collarbone', fit: 'Ideal for petite necks and crew neck tops' },
                { len: '18 inches (45 cm)', pos: 'Princess length / sits just below collarbone', fit: 'Our most requested everyday pendant chain' },
                { len: '20 inches (50 cm)', pos: 'Matinee length / falls several inches below collarbone', fit: 'Great for layering or lower necklines' },
                { len: '22 - 24 inches (55 - 60 cm)', pos: 'Opera length / chest level', fit: "Popular for men's Cuban chains & statement lockets" },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl border border-pink-100 dark:border-stone-800 bg-pink-50/20">
                  <p className="font-bold text-pink-600 dark:text-pink-400 text-base">{c.len}</p>
                  <p className="font-medium text-xs text-stone-800 dark:text-stone-200 mt-1">{c.pos}</p>
                  <p className="text-xs text-stone-500 mt-1">Best style: {c.fit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'kada' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-stone-100 font-normal">
              Kada &amp; Bangle Sizing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { size: 'Size 2.2', dia: '5.5 cm', wrist: 'Fits wrists up to 14.5 cm (Small)' },
                { size: 'Size 2.4', dia: '6.0 cm', wrist: 'Fits wrists 15 - 16.5 cm (Medium / Standard)' },
                { size: 'Size 2.6', dia: '6.5 cm', wrist: 'Fits wrists 17 - 18.5 cm (Large)' },
              ].map((k, i) => (
                <div key={i} className="p-4 rounded-2xl border border-pink-100 dark:border-stone-800 bg-pink-50/20 text-center">
                  <p className="font-bold text-pink-600 dark:text-pink-400 text-lg">{k.size}</p>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1">Inner Dia: {k.dia}</p>
                  <p className="text-xs text-stone-500 mt-1">{k.wrist}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Note: Most of our anti-tarnish cuff kadas feature a concealed hinge lock that opens laterally, making them effortlessly easy to put on and take off without sliding over broad palms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

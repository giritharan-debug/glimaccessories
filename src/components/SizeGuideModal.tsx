import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { SizeGuideType } from '@/types';

interface SizeGuideModalProps {
  type: SizeGuideType;
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ type, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ring' | 'kada' | 'chain'>(type || 'chain');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-pink-100 dark:border-stone-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Glim Accessories • Size &amp; Length Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40">
          {[
            { id: 'chain', label: 'Chains & Necklaces' },
            { id: 'ring', label: 'Rings Size Chart' },
            { id: 'kada', label: 'Kadas & Bracelets' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'ring' | 'kada' | 'chain')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-white dark:bg-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-700 dark:text-stone-300 text-sm">
          {activeTab === 'chain' && (
            <div className="space-y-4">
              <h4 className="font-serif font-semibold text-base text-stone-900 dark:text-stone-100">
                Standard Chain Length Placements
              </h4>
              <p className="text-xs text-stone-500">
                How chain lengths fall on the neck and chest collarbone:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { length: '16 inch (40 cm)', fall: 'Choker style / tight collarbone', best: 'Petite frames, open v-neck tops' },
                  { length: '18 inch (45 cm)', fall: 'Standard princess length below collarbone', best: 'Most popular! Perfect for pendants' },
                  { length: '20 inch (50 cm)', fall: 'Matinee length, falls a few inches below collarbone', best: 'Crew necks, plunging necklines, layering' },
                  { length: '22-24 inch (55-60 cm)', fall: 'Chest level / Cuban chain length', best: "Men's chains, high turtlenecks, statement drops" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-pink-100 dark:border-stone-800 bg-pink-50/30 dark:bg-stone-800/40">
                    <p className="font-bold text-pink-700 dark:text-pink-300 text-sm">{item.length}</p>
                    <p className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-0.5">{item.fall}</p>
                    <p className="text-[11px] text-stone-500 mt-1">Best for: {item.best}</p>
                  </div>
                ))}
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-stone-800 dark:text-stone-100">💡 Pro Tip for Layering:</p>
                <p>Pair a 16" choker with an 18" dainty pendant and a 20" snake chain for the trending curated neckline!</p>
              </div>
            </div>
          )}

          {activeTab === 'ring' && (
            <div className="space-y-4">
              <h4 className="font-serif font-semibold text-base text-stone-900 dark:text-stone-100">
                Ring Sizing Chart &amp; How to Measure at Home
              </h4>

              {/* Table */}
              <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-pink-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">US Size</th>
                      <th className="p-2.5">Inner Diameter (mm)</th>
                      <th className="p-2.5">Finger Circumference (mm)</th>
                      <th className="p-2.5">Indian Size Approx.</th>
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
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-pink-50/20">
                        <td className="p-2.5 font-bold text-pink-600 dark:text-pink-400">{row.us}</td>
                        <td className="p-2.5">{row.dia}</td>
                        <td className="p-2.5">{row.circ}</td>
                        <td className="p-2.5 font-medium">{row.ind}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How to measure */}
              <div className="space-y-2 text-xs">
                <h5 className="font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Easy 3-Step Measurement:
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-400 pl-1">
                  <li>Wrap a thin strip of paper or non-stretchy thread snugly around the base of the finger you intend to wear the ring on.</li>
                  <li>Mark the spot where the paper/thread overlaps with a pen.</li>
                  <li>Lay the paper flat on a ruler and measure the length in millimeters (mm) to match the circumference above!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'kada' && (
            <div className="space-y-4">
              <h4 className="font-serif font-semibold text-base text-stone-900 dark:text-stone-100">
                Kada &amp; Bangle Wrist Size Guide
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { size: 'Size 2.2 (Small)', dia: '5.5 cm / 2.2 inches', wrist: 'Fits wrists up to 14.5 cm' },
                  { size: 'Size 2.4 (Medium - Most Popular)', dia: '6.0 cm / 2.4 inches', wrist: 'Fits wrists 15 - 16.5 cm' },
                  { size: 'Size 2.6 (Large)', dia: '6.5 cm / 2.6 inches', wrist: 'Fits wrists 17 - 18.5 cm' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-pink-100 dark:border-stone-800 bg-pink-50/20 text-center">
                    <p className="font-bold text-pink-700 dark:text-pink-300 text-sm">{item.size}</p>
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1">Inner: {item.dia}</p>
                    <p className="text-[11px] text-stone-500 mt-1">{item.wrist}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                ⚠️ <strong>Note on Oval Kadas:</strong> Our anti-tarnish Roman numeral kadas are crafted with a concealed side clasp that clicks open, making them easy to put on even if you have larger knuckles!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-pink-600 dark:hover:bg-pink-700 text-xs font-semibold transition-colors"
          >
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
};

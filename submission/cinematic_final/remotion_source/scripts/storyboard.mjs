export const storyboard = {
  ch1: (a) => ({
    segments: [{ id: 'ch1', from: 0, to: a.total, note: 'THE HOOK · HUMAN-LED INNOVATION' }],
    events: [
      { at: a.beatStart(0), text: 'PRODUCTS SHOULD BEGIN WITH PEOPLE.' },
    ],
    zooms: [
      { t: 0, s: 1.0, x: 50, y: 50 },
      { t: a.total * 0.55, s: 1.32, x: 72, y: 42 },
      { t: a.total, s: 1.12, x: 50, y: 50 },
    ],
    clicks: [],
    focuses: [
      { atSec: 1.8, durSec: 4.5, x: 56, y: 16, w: 34, h: 46, label: '3D GENESIS ENGINE' },
    ],
  }),
  ch2: (a) => ({
    segments: [{ id: 'ch2', from: 0, to: a.total, note: 'LIVE AT GENESIS.GREENMIXLABS.COM · NO SIGNUP' }],
    events: [
      { at: a.beatStart(0), text: 'PAYPAL GENESIS · TWO-SIDED PLATFORM' },
      { at: a.at('Judge Demo'), text: 'ONE-CLICK JUDGE DEMO ACCESS' },
    ],
    zooms: [
      { t: 0, s: 1.04, x: 50, y: 50 },
      { t: a.total * 0.4, s: 1.54, x: 18, y: 50 },
      { t: a.total * 0.82, s: 1.48, x: 24, y: 50 },
      { t: a.total, s: 1.1, x: 30, y: 50 },
    ],
    clicks: [
      { atSec: 3.4, x: 11.2, y: 50.2, label: 'Continue as Consumer' },
      { atSec: 7.4, x: 25.2, y: 50.2, label: 'Explore as Manufacturer' },
    ],
    focuses: [
      { atSec: 2.2, durSec: 6.8, x: 3.2, y: 45, w: 30.5, h: 10.5, label: 'ONE-CLICK JUDGE DEMO' },
    ],
  }),
  ch3: (a) => ({
    segments: [{ id: 'ch3', from: 0, to: a.total }],
    events: [
      { at: a.beatStart(0), text: 'CONSUMER IDEA CREATION' },
      { at: a.at('four guided'), text: '4-STEP CONCEPT STUDIO' },
    ],
    zooms: [
      { t: 0, s: 1.0, x: 50, y: 50 },
      { t: a.total * 0.45, s: 1.36, x: 28, y: 48 },
      { t: a.total * 0.85, s: 1.5, x: 92, y: 82 },
      { t: a.total, s: 1.14, x: 85, y: 75 },
    ],
    clicks: [
      { atSec: 9.8, x: 93.4, y: 82.4, label: 'Continue' },
    ],
    focuses: [
      { atSec: 1.8, durSec: 6.8, x: 3, y: 27, w: 54, h: 55, label: '4-STEP CONCEPT WIZARD' },
    ],
  }),
  ch4: (a) => ({
    segments: [{ id: 'ch4', from: 0, to: a.total, note: 'PERSISTED IN CLOUDFLARE D1' }],
    events: [
      { at: a.beatStart(0), text: 'GENESIS INTELLIGENCE ENGINE' },
      { at: a.at('engineering specifications'), text: 'STRUCTURED & EDITABLE SPECS' },
    ],
    zooms: [
      { t: 0, s: 1.04, x: 50, y: 50 },
      { t: a.total * 0.45, s: 1.44, x: 20, y: 74 },
      { t: a.total * 0.82, s: 1.32, x: 34, y: 56 },
      { t: a.total, s: 1.08, x: 40, y: 50 },
    ],
    clicks: [
      { atSec: 5.6, x: 20.4, y: 75.4, label: 'Review & Publish' },
    ],
    focuses: [
      { atSec: 2.0, durSec: 8.5, x: 3, y: 35, w: 54, h: 45, label: 'STRUCTURED ENGINEERING SPECS' },
    ],
  }),
  ch5: (a) => ({
    segments: [{ id: 'ch5', from: 0, to: a.total }],
    events: [
      { at: a.beatStart(0), text: 'COMMUNITY DEMAND SIGNALS' },
      { at: a.at('genuine customer'), text: 'PURCHASE INTENT & FIELD REPORTS' },
    ],
    zooms: [
      { t: 0, s: 1.0, x: 50, y: 50 },
      { t: a.total * 0.5, s: 1.52, x: 76, y: 34 },
      { t: a.total, s: 1.15, x: 68, y: 38 },
    ],
    clicks: [
      { atSec: 4.5, x: 72.5, y: 36.2, label: 'I might buy this' },
    ],
    focuses: [
      { atSec: 1.6, durSec: 6.4, x: 60, y: 19, w: 38, h: 22, label: 'LIVE COMMUNITY DEMAND' },
    ],
  }),
  ch6: (a) => ({
    segments: [{ id: 'ch6', from: 0, to: a.total, note: 'AG GRID v36 · AG STUDIO v3.1 · AG CHARTS v14' }],
    events: [
      { at: a.beatStart(0), text: 'AG STUDIO INTELLIGENCE' },
      { at: a.at('AG Grid'), text: 'AG GRID · LIVE SORT & CROSS-FILTER' },
      { at: a.at('Opportunity Spotlight'), text: 'CUSTOM WIDGETS · BRIEF & CSV EXPORT' },
    ],
    zooms: [
      { t: 0, s: 1.0, x: 50, y: 50 },
      { t: a.total * 0.28, s: 1.44, x: 30, y: 66 },
      { t: a.total * 0.62, s: 1.38, x: 68, y: 52 },
      { t: a.total * 0.86, s: 1.48, x: 18, y: 35 },
      { t: a.total, s: 1.06, x: 50, y: 50 },
    ],
    clicks: [
      { atSec: 5.5, x: 49.4, y: 58.8, label: 'Manage Opportunity' },
      { atSec: 14.5, x: 21.0, y: 34.8, label: 'Export CSV' },
    ],
    focuses: [
      { atSec: 1.6, durSec: 7.0, x: 3, y: 49, w: 55, h: 24, label: 'AG GRID v36 · DEMAND EXPLORER' },
      { atSec: 9.2, durSec: 6.5, x: 58, y: 30, w: 30, h: 42, label: 'AG STUDIO v3.1 · CHARTS & FILTERS' },
    ],
  }),
  ch7: (a) => ({
    segments: [{ id: 'ch7', from: 0, to: a.total }],
    events: [
      { at: a.beatStart(0), text: 'MANUFACTURER ACTION' },
      { at: a.at('batch production'), text: 'BATCH OFFERS & MILESTONE TRACKING' },
    ],
    zooms: [
      { t: 0, s: 1.02, x: 50, y: 50 },
      { t: a.total * 0.5, s: 1.48, x: 78, y: 54 },
      { t: a.total, s: 1.12, x: 68, y: 50 },
    ],
    clicks: [
      { atSec: 5.0, x: 78.5, y: 56.0, label: 'Submit Batch Offer' },
    ],
    focuses: [
      { atSec: 1.5, durSec: 7.8, x: 60, y: 15, w: 38, h: 49, label: 'SPECIFICATIONS & BATCH OFFER' },
    ],
  }),
  ch8: (a) => ({
    segments: [{ id: 'ch8', from: 0, to: a.total, note: 'VERIFIED SANDBOX CAPTURE · $115.00 USD' }],
    events: [
      { at: a.beatStart(0), text: 'PAYPAL SANDBOX CHECKOUT' },
      { at: a.at('idempotent'), text: 'ORDERS API v2 · IDEMPOTENT CAPTURE' },
    ],
    zooms: [
      { t: 0, s: 1.0, x: 50, y: 50 },
      { t: a.total * 0.35, s: 1.5, x: 80, y: 40 },
      { t: a.total * 0.72, s: 1.42, x: 38, y: 42 },
      { t: a.total, s: 1.1, x: 50, y: 50 },
    ],
    clicks: [
      { atSec: 6.4, x: 49.8, y: 65.5, label: 'View Order Details' },
    ],
    focuses: [
      { atSec: 1.6, durSec: 5.5, x: 68, y: 31, w: 28, h: 16, label: 'PAYPAL ORDERS v2 · SANDBOX VERIFIED' },
      { atSec: 7.6, durSec: 5.5, x: 25, y: 30, w: 28, h: 18, label: 'CAPTURED · $115.00 USD' },
    ],
  }),
  ch9: (a) => ({
    segments: [{ id: 'ch1', from: 0, to: a.total, note: 'MIT OPEN SOURCE · CLOUDFLARE WORKERS & D1' }],
    events: [
      { at: a.beatStart(0), text: 'THE COMPLETE JOURNEY' },
    ],
    zooms: [
      { t: 0, s: 1.04, x: 50, y: 68 },
      { t: a.total * 0.65, s: 1.24, x: 50, y: 72 },
      { t: a.total, s: 1.05, x: 50, y: 50 },
    ],
    clicks: [],
    focuses: [
      { atSec: 0.8, durSec: 5.8, x: 3.5, y: 65, w: 93, h: 13, label: 'IDEA → INTELLIGENCE → DEMAND → MANUFACTURING → PAYPAL' },
    ],
  }),
  ch10: (a) => ({
    segments: [],
    events: [
      { at: a.beatStart(0), text: 'PAYPAL GENESIS' },
    ],
    zooms: [],
    clicks: [],
    focuses: [],
  }),
};

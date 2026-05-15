export const NAVY = '#0F1E4F';
export const NAVY_LINE = '#0F1E4F';
export const NAVY_SOFT = '#2D3F75';
export const PAGE_BG = '#FFFFFF';

// TODO(invenex): fill in the real company details before sending any
// quote/invoice. These placeholders MUST be replaced — the GSTIN /
// address / phone here are intentionally not real.
export const INVENEX_PROFILE = {
  name: 'Invenex',
  tagline: 'TODO: Invenex tagline',
  addressLine: 'TODO: Invenex registered address',
  phone: 'TODO: +91 XXXXX XXXXX',
  email: 'TODO: hello@invenex.example',
  website: 'TODO: www.invenex.example',
  gst: 'TODO: Invenex GSTIN',
} as const;

export const STANDARD_TERMS = [
  'Prices quoted are valid for 7 days from the issue date.',
  'Payment terms: 20% advance, remaining upon delivery.',
  'Delivery Timeline: 10–12 working days from confirmation of purchase order and advance payment.',
  'All customer drawings and technical data will be treated as confidential.',
].join('\n');

export const THANK_YOU = {
  heading: 'THANK YOU FOR YOUR BUSINESS.',
  body: 'We appreciate the opportunity to work with you and look forward to a long-term partnership.',
} as const;

export const SIGNATURE_LINES = {
  heading: 'For INVENEX',
  subheading: 'Managing Partner',
} as const;

// ---------- Quote cover + about page content ----------

export const QUOTE_COVER = {
  eyebrow: 'QUOTATION',
  preparedFor: 'Prepared for',
} as const;

// TODO(invenex): rewrite this entire block for Invenex's actual
// business/industry. The text below is placeholder copy carried over
// from the original template and does NOT describe Invenex.
export const ABOUT_CONTENT = {
  eyebrow: 'WHO WE ARE',
  headline: 'TODO: Invenex headline',
  lead: 'TODO: one-sentence Invenex positioning statement.',
  paragraphs: [
    'TODO: Invenex company paragraph 1.',
    'TODO: Invenex company paragraph 2.',
  ],
  pillars: [
    { title: 'TODO 1', description: 'TODO: pillar 1 description.' },
    { title: 'TODO 2', description: 'TODO: pillar 2 description.' },
    { title: 'TODO 3', description: 'TODO: pillar 3 description.' },
  ],
  vision: {
    label: 'OUR VISION',
    body: 'TODO: Invenex vision statement.',
  },
  mission: {
    label: 'OUR MISSION',
    body: 'TODO: Invenex mission statement.',
  },
} as const;

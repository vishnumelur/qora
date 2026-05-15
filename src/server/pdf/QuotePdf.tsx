import 'server-only';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import path from 'node:path';

// NotoSans (variable) includes the Indian Rupee glyph (U+20B9) and full Latin.
// Font.register is idempotent — safe even when DocumentPdf has already run it.
const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Variable.ttf');
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: FONT_PATH, fontWeight: 400 },
    { src: FONT_PATH, fontWeight: 700 },
  ],
});

import { inr, fmtDate } from './format';
import {
  NAVY,
  NAVY_LINE,
  NAVY_SOFT,
  INVENEX_PROFILE,
  THANK_YOU,
  SIGNATURE_LINES,
  QUOTE_COVER,
  ABOUT_CONTENT,
} from './constants';
import { recordTotals } from '@/server/domain/totals';
import type { DocumentPdfProps } from './DocumentPdf';

const LOGO_PATH = path.join(process.cwd(), 'public', 'logo-icon.png');
const SEAL_PATH = path.join(process.cwd(), 'public', 'seal.png');

const PAGE_PADDING = 36;
const ZEBRA = '#F7F8FB';
const RULE = '#E5E7EB';
const MUTED = '#6B7280';
const INK = '#111827';
const SOFT_BG = '#F4F5F8';

const styles = StyleSheet.create({
  // -------- shared --------
  pageBase: {
    fontFamily: 'NotoSans',
    fontSize: 10,
    color: INK,
    backgroundColor: '#FFFFFF',
  },
  topBar: { height: 4, backgroundColor: NAVY },
  bottomBar: { height: 4, backgroundColor: NAVY },
  pageLabel: {
    position: 'absolute',
    top: 16,
    right: PAGE_PADDING,
    fontSize: 9,
    color: NAVY_SOFT,
    letterSpacing: 2,
    fontWeight: 700,
  },

  // -------- page 1: cover (editorial, left-aligned) --------
  coverBody: {
    flex: 1,
    paddingHorizontal: 56,
    paddingTop: 32,
    paddingBottom: 40,
  },
  coverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverWordmarkSmall: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 4,
    color: NAVY,
  },
  coverCircle: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    border: `1pt solid ${NAVY}`,
    opacity: 0.08,
    top: 60,
    right: -130,
  },
  coverHeroSpacer: { flex: 1.1 },
  coverHero: {},
  coverLogo: { width: 56, height: 56, marginBottom: 26 },
  coverBrand: {
    fontSize: 54,
    fontWeight: 700,
    color: NAVY,
    letterSpacing: 12,
  },
  coverAccentBar: {
    width: 56,
    height: 3,
    backgroundColor: NAVY,
    marginTop: 22,
    marginBottom: 14,
  },
  coverTagline: {
    fontSize: 11,
    color: MUTED,
    letterSpacing: 1.5,
  },
  coverDocSpacer: { flex: 1.5 },
  coverDoc: {},
  coverEyebrow: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 6,
    color: NAVY,
    marginBottom: 10,
  },
  coverNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.5,
    maxWidth: 420,
    marginBottom: 30,
  },
  coverPreparedFor: {
    fontSize: 9,
    fontWeight: 700,
    color: MUTED,
    letterSpacing: 3,
    marginBottom: 6,
  },
  coverCustomer: {
    fontSize: 14,
    fontWeight: 700,
    color: NAVY,
  },
  coverHairline: {
    width: 160,
    height: 1,
    backgroundColor: '#D1D5DB',
    marginTop: 12,
    marginBottom: 10,
  },
  coverDates: {
    fontSize: 10,
    color: MUTED,
  },
  coverFooter: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTop: `1pt solid ${RULE}`,
  },
  coverFooterText: { fontSize: 9, color: MUTED },

  // -------- page 2: about (magazine spread, two-column body) --------
  aboutBody: { flex: 1, paddingHorizontal: PAGE_PADDING, paddingTop: 24, paddingBottom: 28 },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  aboutHeaderLogo: { width: 18, height: 18, marginRight: 8 },
  aboutHeaderBrand: { fontSize: 10, fontWeight: 700, color: NAVY, letterSpacing: 3 },
  aboutDivider: { height: 1, backgroundColor: RULE, marginTop: 14, marginBottom: 30 },
  aboutEyebrow: {
    fontSize: 9,
    fontWeight: 700,
    color: NAVY,
    letterSpacing: 4,
    marginBottom: 12,
  },
  aboutHeadline: {
    fontSize: 24,
    fontWeight: 700,
    color: NAVY,
    lineHeight: 1.22,
    maxWidth: '85%',
    marginBottom: 16,
  },
  aboutLead: {
    fontSize: 11.5,
    color: '#374151',
    lineHeight: 1.55,
    maxWidth: '90%',
    marginBottom: 26,
  },
  aboutColumns: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 28,
  },
  aboutCol: { flex: 1 },
  aboutPara: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.65,
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  pillarCard: {
    flex: 1,
    backgroundColor: SOFT_BG,
    padding: 14,
    borderLeft: `3pt solid ${NAVY}`,
  },
  pillarTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 6,
    letterSpacing: 2,
  },
  pillarBody: { fontSize: 9.5, color: '#374151', lineHeight: 1.5 },
  vmRow: { flexDirection: 'row', gap: 12, width: '88%' },
  vmCard: {
    flex: 1,
    minHeight: 130,
    padding: 18,
  },
  vmCardNavy: { backgroundColor: NAVY },
  vmCardSoft: { backgroundColor: NAVY_SOFT },
  vmLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#C7D2FE',
    letterSpacing: 3,
    marginBottom: 10,
  },
  vmBody: {
    fontSize: 11,
    color: '#FFFFFF',
    lineHeight: 1.5,
  },
  aboutFooter: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTop: `1pt solid ${RULE}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutFooterText: { fontSize: 9, color: MUTED },

  // -------- page 3: quote details (polished) --------
  detailsBody: { flex: 1, paddingHorizontal: PAGE_PADDING, paddingTop: 28, paddingBottom: 28 },
  detailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  detailsLogo: { width: 36, height: 36, marginRight: 12 },
  detailsBrand: { fontSize: 16, fontWeight: 700, color: INK },
  detailsTagline: { fontSize: 9, color: '#4B5563', marginTop: 2 },
  sectionEyebrow: {
    fontSize: 8,
    fontWeight: 700,
    color: NAVY,
    letterSpacing: 3,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metaCol: { width: '48%' },
  metaHeading: {
    fontSize: 11,
    fontWeight: 700,
    textDecoration: 'underline',
    marginBottom: 4,
    textAlign: 'right',
  },
  rightAligned: { textAlign: 'right' },
  title: { fontSize: 13, fontWeight: 700, marginTop: 6, marginBottom: 10 },
  tableBox: { border: `1pt solid ${NAVY}`, borderRadius: 4, marginBottom: 14 },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    color: '#FFF',
    padding: 6,
    fontWeight: 700,
  },
  tableRow: { flexDirection: 'row', padding: 6, borderTop: `1pt solid ${RULE}` },
  tableRowAlt: { backgroundColor: ZEBRA },
  c1: { width: '50%' },
  c2: { width: '12%', textAlign: 'right' },
  c3: { width: '19%', textAlign: 'right' },
  c4: { width: '19%', textAlign: 'right' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  termsCol: { width: '55%' },
  totalsCol: { width: '42%' },
  termsItem: { marginBottom: 3, paddingLeft: 8 },
  totalsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalsBig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NAVY,
    color: '#FFF',
    padding: 6,
    marginTop: 6,
    fontWeight: 700,
  },
  thankYouHeading: { fontSize: 12, fontWeight: 700, marginTop: 24, color: NAVY },
  thankYouBody: { marginTop: 6, fontSize: 10 },
  signatureRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 28 },
  signatureText: { fontSize: 10 },
  signatureBrand: { fontSize: 12, fontWeight: 700, marginBottom: 2 },
  seal: { width: 65, height: 65, marginRight: 16 },
});

function CoverPage(props: DocumentPdfProps) {
  return (
    <Page size="A4" style={styles.pageBase}>
      <View style={styles.topBar} />
      <View style={styles.coverCircle} />

      <View style={styles.coverBody}>
        <View style={styles.coverTopRow}>
          <Text style={styles.coverWordmarkSmall}>INVENEX</Text>
          <Text style={styles.coverWordmarkSmall}>01 / 03</Text>
        </View>

        <View style={styles.coverHeroSpacer} />

        <View style={styles.coverHero}>
          <Image style={styles.coverLogo} src={LOGO_PATH} />
          <Text style={styles.coverBrand}>INVENEX</Text>
          <View style={styles.coverAccentBar} />
          <Text style={styles.coverTagline}>{INVENEX_PROFILE.tagline}</Text>
        </View>

        <View style={styles.coverDocSpacer} />

        <View style={styles.coverDoc}>
          <Text style={styles.coverEyebrow}>{QUOTE_COVER.eyebrow}</Text>
          <Text style={styles.coverNumber}>{props.number}</Text>
          <Text style={styles.coverTitle}>{props.title}</Text>

          <Text style={styles.coverPreparedFor}>
            {QUOTE_COVER.preparedFor.toUpperCase()}
          </Text>
          <Text style={styles.coverCustomer}>{props.customer.name}</Text>
          <View style={styles.coverHairline} />
          <Text style={styles.coverDates}>
            {fmtDate(props.issueDate)}
            {props.secondDate ? `   ·   Valid until ${fmtDate(props.secondDate)}` : ''}
          </Text>
        </View>

        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>{INVENEX_PROFILE.website}</Text>
          <Text style={styles.coverFooterText}>
            {INVENEX_PROFILE.phone}  ·  {INVENEX_PROFILE.email}
          </Text>
          <Text style={styles.coverFooterText}>{INVENEX_PROFILE.addressLine}</Text>
        </View>
      </View>

      <View style={styles.bottomBar} />
    </Page>
  );
}

function AboutPage() {
  return (
    <Page size="A4" style={styles.pageBase}>
      <View style={styles.topBar} />
      <View style={styles.aboutBody}>
        <View style={styles.aboutHeader}>
          <View style={styles.aboutHeaderLeft}>
            <Image style={styles.aboutHeaderLogo} src={LOGO_PATH} />
            <Text style={styles.aboutHeaderBrand}>INVENEX</Text>
          </View>
          <Text style={styles.coverWordmarkSmall}>ABOUT · 02 / 03</Text>
        </View>
        <View style={styles.aboutDivider} />

        <Text style={styles.aboutEyebrow}>{ABOUT_CONTENT.eyebrow}</Text>
        <Text style={styles.aboutHeadline}>{ABOUT_CONTENT.headline}</Text>
        <Text style={styles.aboutLead}>{ABOUT_CONTENT.lead}</Text>

        <View style={styles.aboutColumns}>
          {ABOUT_CONTENT.paragraphs.map((p, i) => (
            <View key={i} style={styles.aboutCol}>
              <Text style={styles.aboutPara}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pillarsRow}>
          {ABOUT_CONTENT.pillars.map((pillar) => (
            <View key={pillar.title} style={styles.pillarCard}>
              <Text style={styles.pillarTitle}>{pillar.title.toUpperCase()}</Text>
              <Text style={styles.pillarBody}>{pillar.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.vmRow}>
          <View style={[styles.vmCard, styles.vmCardNavy]}>
            <Text style={styles.vmLabel}>{ABOUT_CONTENT.vision.label}</Text>
            <Text style={styles.vmBody}>{ABOUT_CONTENT.vision.body}</Text>
          </View>
          <View style={[styles.vmCard, styles.vmCardSoft]}>
            <Text style={styles.vmLabel}>{ABOUT_CONTENT.mission.label}</Text>
            <Text style={styles.vmBody}>{ABOUT_CONTENT.mission.body}</Text>
          </View>
        </View>

        <View style={styles.aboutFooter}>
          <Text style={styles.aboutFooterText}>{INVENEX_PROFILE.website}</Text>
          <Text style={styles.aboutFooterText}>
            {INVENEX_PROFILE.phone}  ·  {INVENEX_PROFILE.email}
          </Text>
          <Text style={styles.aboutFooterText}>GSTIN: {INVENEX_PROFILE.gst}</Text>
        </View>
      </View>
      <View style={styles.bottomBar} />
    </Page>
  );
}

function DetailsPage(props: DocumentPdfProps) {
  const totals = recordTotals(props.items, props.gstPercent);

  return (
    <Page size="A4" style={styles.pageBase}>
      <View style={styles.topBar} />
      <View style={styles.detailsBody}>
        <View style={styles.detailsHeaderRow}>
          <Image style={styles.detailsLogo} src={LOGO_PATH} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailsBrand}>INVENEX</Text>
            <Text style={styles.detailsTagline}>{INVENEX_PROFILE.tagline}</Text>
          </View>
          <Text style={styles.coverWordmarkSmall}>QUOTE · 03 / 03</Text>
        </View>

        <Text style={styles.sectionEyebrow}>QUOTE DETAILS</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text>Date: {fmtDate(props.issueDate)}</Text>
            {props.secondDate && <Text>Valid Until: {fmtDate(props.secondDate)}</Text>}
            <Text style={{ marginTop: 6 }}>{INVENEX_PROFILE.name}</Text>
            <Text>{INVENEX_PROFILE.addressLine}</Text>
            <Text>{INVENEX_PROFILE.phone}</Text>
            <Text>{INVENEX_PROFILE.email}</Text>
            <Text>{INVENEX_PROFILE.website}</Text>
            <Text style={{ marginTop: 4 }}>GSTIN: {INVENEX_PROFILE.gst}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>QUOTATION FOR</Text>
            <Text style={styles.rightAligned}>{props.customer.name}</Text>
            {props.customer.attention && (
              <Text style={styles.rightAligned}>{props.customer.attention}</Text>
            )}
            {props.customer.addressLine && (
              <Text style={styles.rightAligned}>{props.customer.addressLine}</Text>
            )}
            <Text style={[styles.rightAligned, { marginTop: 12, fontWeight: 700 }]}>
              {props.number}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{props.title}</Text>

        <Text style={styles.sectionEyebrow}>ITEMS</Text>
        <View style={styles.tableBox}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.c1}>ITEM DESCRIPTION</Text>
            <Text style={styles.c2}>QUANTITY</Text>
            <Text style={styles.c3}>UNIT PRICE</Text>
            <Text style={styles.c4}>SUBTOTAL</Text>
          </View>
          {props.items.map((it, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={styles.c1}>{it.description}</Text>
              <Text style={styles.c2}>{it.quantity}</Text>
              <Text style={styles.c3}>{inr(it.unitPrice)}</Text>
              <Text style={styles.c4}>
                {inr(Number(it.quantity) * Number(it.unitPrice))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.termsCol}>
            <Text style={styles.sectionEyebrow}>TERMS &amp; CONDITIONS</Text>
            {props.terms
              .split('\n')
              .filter((l) => l.trim())
              .map((line, i) => (
                <Text key={i} style={styles.termsItem}>
                  • {line}
                </Text>
              ))}
          </View>
          <View style={styles.totalsCol}>
            <Text style={styles.sectionEyebrow}>SUMMARY</Text>
            <View style={styles.totalsLine}>
              <Text>Subtotal :</Text>
              <Text>{inr(totals.subtotal)}</Text>
            </View>
            <View style={styles.totalsLine}>
              <Text>GST {props.gstPercent}%:</Text>
              <Text>{inr(totals.gstAmount)}</Text>
            </View>
            <View style={styles.totalsBig}>
              <Text>TOTAL :</Text>
              <Text>{inr(totals.total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.thankYouHeading}>{THANK_YOU.heading}</Text>
        <Text style={styles.thankYouBody}>{THANK_YOU.body}</Text>

        <View style={styles.signatureRow}>
          <Image style={styles.seal} src={SEAL_PATH} />
          <View>
            <Text style={styles.signatureBrand}>{SIGNATURE_LINES.heading}</Text>
            <Text style={styles.signatureText}>{SIGNATURE_LINES.subheading}</Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomBar} />
    </Page>
  );
}

export function QuotePdf(props: DocumentPdfProps) {
  return (
    <Document
      title={`${props.number} — ${props.title}`}
      author={INVENEX_PROFILE.name}
      subject="Quotation"
    >
      <CoverPage {...props} />
      <AboutPage />
      <DetailsPage {...props} />
    </Document>
  );
}

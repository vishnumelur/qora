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
// Registered once at module load; the font ships with the function bundle.
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
  INVENEX_PROFILE,
  THANK_YOU,
  SIGNATURE_LINES,
} from './constants';
import { recordTotals } from '@/server/domain/totals';

export type DocumentPdfProps = {
  kind: 'quote' | 'invoice';
  number: string;
  title: string;
  issueDate: string;
  secondDate: string | null;
  customer: { name: string; attention: string | null; addressLine: string | null };
  items: { description: string; quantity: string; unitPrice: string }[];
  gstPercent: string;
  terms: string;
  status: string;
};

const styles = StyleSheet.create({
  page: { fontFamily: 'NotoSans', padding: 36, fontSize: 10, color: '#111' },
  topLine: { height: 1, backgroundColor: NAVY_LINE, marginBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  logo: { width: 36, height: 36, marginRight: 12 },
  brand: { fontSize: 16, fontFamily: 'NotoSans', fontWeight: 700, color: '#111' },
  tagline: { fontSize: 9, color: '#444', marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 18,
  },
  metaCol: { width: '48%' },
  metaHeading: {
    fontSize: 11,
    fontFamily: 'NotoSans', fontWeight: 700,
    textDecoration: 'underline',
    marginBottom: 4,
    textAlign: 'right',
  },
  rightAligned: { textAlign: 'right' },
  title: { fontSize: 13, fontFamily: 'NotoSans', fontWeight: 700, marginTop: 6, marginBottom: 10 },
  tableBox: { border: `1pt solid ${NAVY}`, borderRadius: 4, marginBottom: 14 },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    color: '#FFF',
    padding: 6,
    fontFamily: 'NotoSans', fontWeight: 700,
  },
  tableRow: { flexDirection: 'row', padding: 6, borderTop: '1pt solid #DDD' },
  c1: { width: '50%' },
  c2: { width: '12%', textAlign: 'right' },
  c3: { width: '19%', textAlign: 'right' },
  c4: { width: '19%', textAlign: 'right' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  termsCol: { width: '55%' },
  totalsCol: { width: '42%' },
  termsItem: { marginBottom: 3, paddingLeft: 8 },
  totalsLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalsBig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NAVY,
    color: '#FFF',
    padding: 6,
    marginTop: 6,
    fontFamily: 'NotoSans', fontWeight: 700,
  },
  thankYouHeading: { fontSize: 12, fontFamily: 'NotoSans', fontWeight: 700, marginTop: 24 },
  thankYouBody: { marginTop: 6, fontSize: 10 },
  signatureRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 28 },
  signatureText: { fontSize: 10 },
  signatureBrand: { fontSize: 12, fontFamily: 'NotoSans', fontWeight: 700, marginBottom: 2 },
  seal: { width: 65, height: 65, marginRight: 16 },
  paidStamp: {
    position: 'absolute',
    top: 200,
    left: 200,
    color: '#10B981',
    border: '4pt solid #10B981',
    padding: 12,
    fontSize: 28,
    fontFamily: 'NotoSans', fontWeight: 700,
    transform: 'rotate(-15deg)',
    opacity: 0.7,
  },
});

const LOGO_PATH = path.join(process.cwd(), 'public', 'logo-icon.png');
const SEAL_PATH = path.join(process.cwd(), 'public', 'seal.png');

export function DocumentPdf(props: DocumentPdfProps) {
  const headingForRecipient = props.kind === 'quote' ? 'QUOTATION FOR' : 'INVOICE TO';
  const dateLabel = props.kind === 'quote' ? 'Valid Until' : 'Due Date';
  const totals = recordTotals(props.items, props.gstPercent);
  const showPaid = props.kind === 'invoice' && props.status === 'paid';

  return (
    <Document
      title={`${props.number} — ${props.title}`}
      author={INVENEX_PROFILE.name}
      subject={props.kind === 'quote' ? 'Quotation' : 'Invoice'}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topLine} />
        <View style={styles.headerRow}>
          <Image style={styles.logo} src={LOGO_PATH} />
          <View>
            <Text style={styles.brand}>INVENEX</Text>
            <Text style={styles.tagline}>{INVENEX_PROFILE.tagline}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text>Date: {fmtDate(props.issueDate)}</Text>
            {props.secondDate && (
              <Text>
                {dateLabel}: {fmtDate(props.secondDate)}
              </Text>
            )}
            <Text style={{ marginTop: 6 }}>{INVENEX_PROFILE.name}</Text>
            <Text>{INVENEX_PROFILE.addressLine}</Text>
            <Text>{INVENEX_PROFILE.phone}</Text>
            <Text>{INVENEX_PROFILE.email}</Text>
            <Text>{INVENEX_PROFILE.website}</Text>
            <Text style={{ marginTop: 4 }}>GSTIN: {INVENEX_PROFILE.gst}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>{headingForRecipient}</Text>
            <Text style={styles.rightAligned}>{props.customer.name}</Text>
            {props.customer.attention && (
              <Text style={styles.rightAligned}>{props.customer.attention}</Text>
            )}
            {props.customer.addressLine && (
              <Text style={styles.rightAligned}>{props.customer.addressLine}</Text>
            )}
            <Text style={[styles.rightAligned, { marginTop: 12, fontFamily: 'NotoSans', fontWeight: 700 }]}>
              {props.number}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{props.title}</Text>

        <View style={styles.tableBox}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.c1}>ITEM DESCRIPTION</Text>
            <Text style={styles.c2}>QUANTITY</Text>
            <Text style={styles.c3}>UNIT PRICE</Text>
            <Text style={styles.c4}>SUBTOTAL</Text>
          </View>
          {props.items.map((it, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.c1}>{it.description}</Text>
              <Text style={styles.c2}>{it.quantity}</Text>
              <Text style={styles.c3}>{inr(it.unitPrice)}</Text>
              <Text style={styles.c4}>{inr(Number(it.quantity) * Number(it.unitPrice))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.termsCol}>
            <Text style={{ fontFamily: 'NotoSans', fontWeight: 700, marginBottom: 4 }}>
              TERMS &amp; CONDITIONS:
            </Text>
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

        {showPaid && <Text style={styles.paidStamp}>PAID</Text>}
      </Page>
    </Document>
  );
}

"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional - for better French character support)
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Roboto",
  },
  // Header
  header: {
    flexDirection: "row",
    marginBottom: 30,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#000",
    marginBottom: 5,
  },
  companyDetail: {
    fontSize: 9,
    color: "#333",
    marginBottom: 1,
  },
  // Devis & Client boxes
  boxContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  devisBox: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  clientBox: {
    flex: 1,
  },
  boxHeader: {
    backgroundColor: "#000",
    padding: 6,
  },
  boxHeaderText: {
    color: "white",
    fontWeight: 700,
    fontSize: 11,
    textAlign: "center",
  },
  boxContent: {
    padding: 8,
  },
  boxRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  boxLabel: {
    width: 80,
    fontSize: 9,
    color: "#333",
  },
  boxValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: "#000",
  },
  // Items table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    padding: 8,
  },
  tableHeaderCell: {
    color: "white",
    fontWeight: 700,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 8,
    minHeight: 25,
  },
  colDesignation: { flex: 3 },
  colQuantite: { width: 70, textAlign: "right" },
  colPrix: { width: 70, textAlign: "right" },
  colTotal: { width: 90, textAlign: "right" },
  // Totals
  totalsContainer: {
    marginLeft: "auto",
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  totalLabel: {
    fontSize: 10,
    color: "#333",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#000",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#000",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#000",
  },
  // Amount in words
  amountWords: {
    marginTop: 30,
    flexDirection: "row",
  },
  amountWordsLabel: {
    fontSize: 10,
    fontWeight: 700,
    marginRight: 10,
    color: "#000",
  },
  amountWordsValue: {
    fontSize: 10,
    color: "#000",
    fontWeight: 700,
    textDecoration: "underline",
  },
  // Signature section
  signatureSection: {
    marginTop: 50,
    alignItems: "center",
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 20,
    color: "#000",
  },
  stampBox: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 4,
    padding: 15,
    alignItems: "center",
    width: 200,
  },
  stampText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#000",
  },
  stampDetail: {
    fontSize: 8,
    color: "#333",
    marginTop: 2,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
  },
  paymentInfo: {
    fontSize: 9,
    color: "#000",
  },
  paymentLabel: {
    fontWeight: 700,
  },
});

// Convert number to French words
function numberToFrenchWords(num: number): string {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

  if (num === 0) return "zéro";

  const convertHundreds = (n: number): string => {
    if (n < 20) return units[n];
    if (n < 70) return tens[Math.floor(n / 10)] + (n % 10 ? "-" + units[n % 10] : "");
    if (n < 80) return "soixante-" + units[n - 60];
    if (n < 100) return "quatre-vingt" + (n === 80 ? "s" : "-" + units[n - 80]);
    if (n < 200) return "cent" + (n > 100 ? " " + convertHundreds(n - 100) : "");
    return units[Math.floor(n / 100)] + " cents" + (n % 100 ? " " + convertHundreds(n % 100) : "");
  };

  const parts: string[] = [];
  const millions = Math.floor(num / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = Math.floor(num % 1000);
  const decimals = Math.round((num % 1) * 1000);

  if (millions === 1) parts.push("un million");
  else if (millions > 1) parts.push(convertHundreds(millions) + " millions");

  if (thousands === 1) parts.push("mille");
  else if (thousands > 1) parts.push(convertHundreds(thousands) + " mille");

  if (remainder > 0) parts.push(convertHundreds(remainder));

  let result = parts.join(" ") || "zéro";

  if (decimals > 0) {
    result += " dinars et " + convertHundreds(decimals) + " millimes";
  } else {
    result += " dinars";
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Format number with spaces for thousands (French style)
function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

type InvoiceItem = {
  id: string;
  designation: string;
  quantite: number;
  prixUnit: number;
  total: number;
};

type Invoice = {
  id: string;
  numero: string;
  date: Date;
  clientName: string;
  clientTel: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  sousTotal: number;
  timbre: number;
  total: number;
  items: InvoiceItem[];
};

interface InvoicePDFProps {
  invoice: Invoice;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")} / ${(d.getMonth() + 1).toString().padStart(2, "0")} / ${d.getFullYear()}`;
  };

  // Ensure items is always an array
  const items = invoice.items || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>STE HAKA IMPORT-EXPORT</Text>
            <Text style={styles.companyDetail}>Adresse: Rue Imam Souhnoune, Sidi Achour Nabeul-8000</Text>
            <Text style={styles.companyDetail}>Matricule Fiscale: 1944751Q/N/M/000</Text>
            <Text style={styles.companyDetail}>Tel: +216 98 555 484</Text>
            <Text style={styles.companyDetail}>Email: omegapack.contact@gmail.com</Text>
          </View>
        </View>

        {/* Devis & Client boxes */}
        <View style={styles.boxContainer}>
          <View style={styles.devisBox}>
            <View style={styles.boxHeader}>
              <Text style={styles.boxHeaderText}>DEVIS</Text>
            </View>
            <View style={styles.boxContent}>
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>N° Pièces</Text>
                <Text style={styles.boxValue}>{invoice.numero}</Text>
              </View>
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Date</Text>
                <Text style={styles.boxValue}>{formatDate(invoice.date)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.clientBox}>
            <View style={styles.boxHeader}>
              <Text style={styles.boxHeaderText}>CLIENT</Text>
            </View>
            <View style={styles.boxContent}>
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Entreprise:</Text>
                <Text style={styles.boxValue}>{invoice.clientName}</Text>
              </View>
              {invoice.clientTel && (
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Tel:</Text>
                  <Text style={styles.boxValue}>{invoice.clientTel}</Text>
                </View>
              )}
              {invoice.clientEmail && (
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Email:</Text>
                  <Text style={styles.boxValue}>{invoice.clientEmail}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesignation]}>DESIGNATION</Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantite]}>QUANTITE</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrix]}>PRIX</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>TOTAL</Text>
          </View>
          {items.length > 0 ? (
            items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colDesignation}>{item.designation || ""}</Text>
                <Text style={styles.colQuantite}>{formatNumber(item.quantite || 0)}</Text>
                <Text style={styles.colPrix}>{formatNumber(item.prixUnit || 0)}</Text>
                <Text style={styles.colTotal}>{formatNumber(item.total || 0)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.colDesignation}>Aucun article</Text>
              <Text style={styles.colQuantite}>-</Text>
              <Text style={styles.colPrix}>-</Text>
              <Text style={styles.colTotal}>-</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total :</Text>
            <Text style={styles.totalValue}>{formatNumber(invoice.sousTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Timbre :</Text>
            <Text style={styles.totalValue}>{formatNumber(invoice.timbre)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total :</Text>
            <Text style={styles.grandTotalValue}>{formatNumber(invoice.total)}</Text>
          </View>
        </View>

        {/* Amount in words */}
        <View style={styles.amountWords}>
          <Text style={styles.amountWordsLabel}>Arrêté le présent Devis à la somme de :</Text>
          <Text style={styles.amountWordsValue}>{numberToFrenchWords(invoice.total)}</Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Signature et Cachet de la Société</Text>
          <View style={styles.stampBox}>
            <Text style={styles.stampText}>Sté HAKA IMP . EXP</Text>
            <Text style={styles.stampDetail}>Comm, tous type d&apos;emballage</Text>
            <Text style={styles.stampDetail}>Rue Imam Souhnoune Sidi Achour Nabeul</Text>
            <Text style={styles.stampDetail}>MF: 1944751Q/N/M/000</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>PAYABLE A : </Text>
            SOCIETE HAKA IMPORT-EXPORT
          </Text>
          <Text style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>R.I.B : </Text>
            08 080 0230740023867 58
          </Text>
          <Text style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Banque: </Text>
            BIAT
          </Text>
        </View>
      </Page>
    </Document>
  );
}


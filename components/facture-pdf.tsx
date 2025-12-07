"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register fonts
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
  header: {
    flexDirection: "row",
    marginBottom: 30,
    alignItems: "flex-start",
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 15,
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
  boxContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  factureBox: {
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
    marginBottom: 4,
  },
  boxLabel: {
    width: 70,
    fontWeight: 700,
    fontSize: 9,
    color: "#000",
  },
  boxValue: {
    flex: 1,
    fontSize: 9,
    color: "#333",
  },
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
    borderBottomColor: "#ddd",
    padding: 8,
    minHeight: 30,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 9,
    color: "#333",
  },
  colDesignation: { flex: 3 },
  colQuantite: { width: 60, textAlign: "center" },
  colPrix: { width: 80, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  totalsBox: {
    width: 200,
    borderWidth: 1,
    borderColor: "#000",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  totalRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#f5f5f5",
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
  totalLabelBold: {
    fontSize: 11,
    fontWeight: 700,
    color: "#000",
  },
  totalValueBold: {
    fontSize: 11,
    fontWeight: 700,
    color: "#000",
  },
  amountWords: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  amountWordsLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 3,
  },
  amountWordsValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#000",
  },
  signatureSection: {
    marginTop: 50,
    alignItems: "center",
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 0,
    color: "#000",
  },
  signatureImage: {
    width: 200,
    height: 180,
  },
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

function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

type FactureItem = {
  id: string;
  designation: string;
  quantite: number;
  prixUnit: number;
  total: number;
};

type Facture = {
  id: string;
  numero: string;
  date: Date;
  clientName: string;
  clientTel: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  clientMatriculeFiscale: string | null;
  sousTotal: number;
  timbre: number;
  total: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  items: FactureItem[];
  createdAt: Date;
  updatedAt: Date;
};

interface FacturePDFProps {
  facture: Facture;
}

export function FacturePDF({ facture }: FacturePDFProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")} / ${(d.getMonth() + 1).toString().padStart(2, "0")} / ${d.getFullYear()}`;
  };

  const items = facture.items || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo-ste-haka.png" />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>STE HAKA IMPORT-EXPORT</Text>
            <Text style={styles.companyDetail}>Adresse: Rue Imam Souhnoune, Sidi Achour Nabeul-8000</Text>
            <Text style={styles.companyDetail}>Matricule Fiscale: 1944751Q/N/M/000</Text>
            <Text style={styles.companyDetail}>Tel: +216 98 555 484</Text>
            <Text style={styles.companyDetail}>Email: ste.haka.contact@gmail.com</Text>
          </View>
        </View>

        {/* Facture & Client boxes */}
        <View style={styles.boxContainer}>
          <View style={styles.factureBox}>
            <View style={styles.boxHeader}>
              <Text style={styles.boxHeaderText}>FACTURE</Text>
            </View>
            <View style={styles.boxContent}>
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>N° Pièces</Text>
                <Text style={styles.boxValue}>{facture.numero}</Text>
              </View>
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Date</Text>
                <Text style={styles.boxValue}>{formatDate(facture.date)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.clientBox}>
            <View style={styles.boxHeader}>
              <Text style={styles.boxHeaderText}>CLIENT</Text>
            </View>
            <View style={styles.boxContent}>
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Société</Text>
                <Text style={styles.boxValue}>{facture.clientName}</Text>
              </View>
              {facture.clientTel && (
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Tel</Text>
                  <Text style={styles.boxValue}>{facture.clientTel}</Text>
                </View>
              )}
              {facture.clientEmail && (
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Email</Text>
                  <Text style={styles.boxValue}>{facture.clientEmail}</Text>
                </View>
              )}
              {facture.clientMatriculeFiscale && (
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>MF</Text>
                  <Text style={styles.boxValue}>{facture.clientMatriculeFiscale}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesignation]}>DESIGNATION</Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantite]}>QUANTITE</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrix]}>PRIX (TND)</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>TOTAL (TND)</Text>
          </View>
          {items.length > 0 ? (
            items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDesignation]}>{item.designation || "N/A"}</Text>
                <Text style={[styles.tableCell, styles.colQuantite]}>{formatNumber(item.quantite)}</Text>
                <Text style={[styles.tableCell, styles.colPrix]}>{formatNumber(item.prixUnit)}</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>{formatNumber(item.total)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesignation]}>Aucun article</Text>
              <Text style={[styles.tableCell, styles.colQuantite]}>-</Text>
              <Text style={[styles.tableCell, styles.colPrix]}>-</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>-</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>{formatNumber(facture.sousTotal)} TND</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Timbre</Text>
              <Text style={styles.totalValue}>{formatNumber(facture.timbre)} TND</Text>
            </View>
            <View style={styles.totalRowLast}>
              <Text style={styles.totalLabelBold}>TOTAL</Text>
              <Text style={styles.totalValueBold}>{formatNumber(facture.total)} TND</Text>
            </View>
          </View>
        </View>

        {/* Amount in words */}
        <View style={styles.amountWords}>
          <Text style={styles.amountWordsLabel}>Arrêtée la présente Facture à la somme de :</Text>
          <Text style={styles.amountWordsValue}>{numberToFrenchWords(facture.total)}</Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Signature et Cachet de la Société</Text>
          <Image style={styles.signatureImage} src="/signature-stamp.png" />
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


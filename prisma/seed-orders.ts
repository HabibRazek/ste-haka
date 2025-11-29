import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding orders...");

  const orders = [
    {
      date: new Date("2025-10-30"),
      designation: "1 MARASCA 250ML +BOUCHON NOIR + CARTON 100 ML",
      client: "JEMNI LEILA",
      adresse: "ZAGHOUANE CENTRE",
      telephone: "50087083",
      prixVente: 341000,
      prixAchat: 261000,
    },
    {
      date: new Date("2025-11-05"),
      designation: "BOUCHON NOIR 1600",
      client: "WASSIM WILD DHAOU",
      adresse: "MAHRES SFAX",
      telephone: "55782855",
      prixVente: 728000,
      prixAchat: 640000,
    },
    {
      date: new Date("2025-11-10"),
      designation: "PRODUIT EN VERRE",
      client: "STE FLORENZA",
      adresse: "CENTRE URBAIN TUNIS",
      telephone: "99471047",
      prixVente: 50750,
      prixAchat: 29000,
    },
    {
      date: new Date("2025-11-11"),
      designation: "ETIQUETTE",
      client: "MOHAMED",
      adresse: "RUE TAREK IBN ZIED MARSA",
      telephone: "26950208",
      prixVente: 113000,
      prixAchat: 50000,
    },
    {
      date: new Date("2025-11-13"),
      designation: "DORICA 30 / 750ML",
      client: "HASSENE YAAKOUBI",
      adresse: "RADESS BEN AROUS",
      telephone: "53224245",
      prixVente: 90500,
      prixAchat: 75000,
    },
    {
      date: new Date("2025-11-14"),
      designation: "BOUTEILLE 750ML DORICA AVEC BOUCHONS VERT + COVERS",
      client: "AYMEN BELHADJ",
      adresse: "JARDIN EL MAZEH TUNIS",
      telephone: "21654918",
      prixVente: 173000,
      prixAchat: 140000,
    },
    {
      date: new Date("2025-11-17"),
      designation: "bouteille dorica 0.75 l x 100 + bouchon noir",
      client: "Ste black and white",
      adresse: "rte Mahdia km1.5 bosten sfax",
      telephone: "26724734",
      prixVente: 320000,
      prixAchat: 225000,
    },
    {
      date: new Date("2025-11-24"),
      designation: "bouteille en verre",
      client: "Monia ben othmen",
      adresse: "sidi dhaer bou argoub -Nabeul",
      telephone: "54785012",
      prixVente: 307000,
      prixAchat: 212000,
    },
  ];

  for (const order of orders) {
    await prisma.order.create({ data: order });
    console.log(`Created order for ${order.client}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });


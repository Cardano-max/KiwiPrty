/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;
const rupees = (r: number) => Math.round(r * 100);

function slug(name: string, salt: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    salt
  );
}

async function clear() {
  // child -> parent order
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.supplierOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.priceSlab.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.address.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

const CATEGORIES = [
  { name: "Balloons", slug: "balloons", icon: "🎈" },
  { name: "Decorations", slug: "decorations", icon: "🎉" },
  { name: "Birthday", slug: "birthday", icon: "🎂" },
  { name: "Baby Shower", slug: "baby-shower", icon: "👶" },
  { name: "Return Gifts", slug: "return-gifts", icon: "🎁" },
  { name: "Party Props", slug: "party-props", icon: "🎭" },
  { name: "Theme Decoration", slug: "theme-decoration", icon: "✨" },
  { name: "LED Lights", slug: "led-lights", icon: "💡" },
  { name: "Curtains", slug: "curtains", icon: "🪟" },
  { name: "Cake Toppers", slug: "cake-toppers", icon: "🧁" },
];

interface SeedProduct {
  name: string;
  category: string;
  pricePerUnit: number; // rupees
  unitLabel: string;
  moq: number;
  quantityMultiple: number;
  stock: number;
  gst?: number;
  city: string;
  material?: string;
  color?: string;
  tags?: string[];
  slabs?: { minQty: number; maxQty: number | null; price: number }[];
  imgSeed: string;
  description: string;
}

interface SeedSupplier {
  phone: string;
  companyName: string;
  businessType: string;
  city: string;
  state: string;
  gst: string;
  approved: boolean;
  products: SeedProduct[];
}

const SUPPLIERS: SeedSupplier[] = [
  {
    phone: "9000000010",
    companyName: "Party World Suppliers",
    businessType: "manufacturer",
    city: "Mumbai",
    state: "Maharashtra",
    gst: "27ABCDE1234F1Z5",
    approved: true,
    products: [
      {
        name: "Balloon Decoration Kit (Blue Theme)",
        category: "balloons",
        pricePerUnit: 450,
        unitLabel: "Set",
        moq: 5,
        quantityMultiple: 5,
        stock: 400,
        city: "Mumbai",
        material: "Latex + Foil",
        color: "Blue",
        tags: ["new_arrival", "best_match"],
        imgSeed: "balloonblue",
        description:
          "Complete blue-theme balloon arch kit with latex and foil balloons, ideal for birthdays and baby showers.",
        slabs: [
          { minQty: 5, maxQty: 19, price: 450 },
          { minQty: 20, maxQty: 49, price: 410 },
          { minQty: 50, maxQty: null, price: 380 },
        ],
      },
      {
        name: "Birthday Decoration Combo Pack",
        category: "birthday",
        pricePerUnit: 750,
        unitLabel: "Set",
        moq: 3,
        quantityMultiple: 3,
        stock: 220,
        city: "Mumbai",
        color: "Multi",
        tags: ["trending"],
        imgSeed: "bdaycombo",
        description: "All-in-one birthday combo: banners, balloons, foil curtain and toppers.",
        slabs: [
          { minQty: 3, maxQty: 14, price: 750 },
          { minQty: 15, maxQty: null, price: 690 },
        ],
      },
      {
        name: "Metallic Balloons Set (50 Pcs)",
        category: "balloons",
        pricePerUnit: 220,
        unitLabel: "Pack",
        moq: 10,
        quantityMultiple: 10,
        stock: 680,
        city: "Mumbai",
        material: "Metallic Latex",
        color: "Assorted",
        imgSeed: "metallic",
        description: "Pack of 50 premium metallic latex balloons in assorted party colours.",
        slabs: [
          { minQty: 10, maxQty: 49, price: 220 },
          { minQty: 50, maxQty: null, price: 195 },
        ],
      },
      {
        name: "LED Party Lights (10 Meter)",
        category: "led-lights",
        pricePerUnit: 380,
        unitLabel: "Piece",
        moq: 5,
        quantityMultiple: 5,
        stock: 0,
        city: "Mumbai",
        material: "Copper Wire LED",
        tags: ["clearance"],
        imgSeed: "ledlights",
        description: "10-meter warm-white LED string lights for ambient party décor.",
      },
      {
        name: "Foil Curtain (Gold)",
        category: "decorations",
        pricePerUnit: 120,
        unitLabel: "Piece",
        moq: 20,
        quantityMultiple: 10,
        stock: 1500,
        city: "Mumbai",
        color: "Gold",
        material: "Foil",
        tags: ["fast_moving"],
        imgSeed: "foilgold",
        description: "Shimmering gold foil backdrop curtain, 1m x 2m. A party photo-booth staple.",
        slabs: [
          { minQty: 20, maxQty: 99, price: 120 },
          { minQty: 100, maxQty: null, price: 99 },
        ],
      },
    ],
  },
  {
    phone: "9000000011",
    companyName: "Kraft Party",
    businessType: "wholesaler",
    city: "Surat",
    state: "Gujarat",
    gst: "24KRAFT5678G2Z9",
    approved: true,
    products: [
      {
        name: "Baby Shower Foil Balloon Set",
        category: "baby-shower",
        pricePerUnit: 1650,
        unitLabel: "Set",
        moq: 2,
        quantityMultiple: 1,
        stock: 120,
        city: "Surat",
        color: "Pink",
        tags: ["top_rated"],
        imgSeed: "babyshower",
        description: "Elegant baby-shower foil balloon set with 'Oh Baby' lettering and pastel balloons.",
        slabs: [
          { minQty: 2, maxQty: 9, price: 1650 },
          { minQty: 10, maxQty: null, price: 1490 },
        ],
      },
      {
        name: "Oh Baby Decoration Combo (Blue)",
        category: "theme-decoration",
        pricePerUnit: 1850,
        unitLabel: "Set",
        moq: 2,
        quantityMultiple: 1,
        stock: 90,
        city: "Surat",
        color: "Blue",
        tags: ["best_match", "new_arrival"],
        imgSeed: "ohbabyblue",
        description: "Full blue 'Oh Baby' theme décor combo: arch, backdrop, table skirt and props.",
      },
      {
        name: "Party Poppers (Pack of 12)",
        category: "party-props",
        pricePerUnit: 180,
        unitLabel: "Pack",
        moq: 12,
        quantityMultiple: 12,
        stock: 900,
        city: "Surat",
        tags: ["fast_moving"],
        imgSeed: "poppers",
        description: "Confetti party poppers, pack of 12 — biodegradable confetti.",
        slabs: [
          { minQty: 12, maxQty: 59, price: 180 },
          { minQty: 60, maxQty: null, price: 150 },
        ],
      },
      {
        name: "Diwali Décor Hanging Set",
        category: "decorations",
        pricePerUnit: 540,
        unitLabel: "Set",
        moq: 5,
        quantityMultiple: 5,
        stock: 300,
        city: "Surat",
        color: "Gold/Red",
        tags: ["festival:diwali", "trending"],
        imgSeed: "diwali",
        description: "Festive Diwali hanging décor set: torans, marigold strings and diyas.",
      },
    ],
  },
  {
    phone: "9000000012",
    companyName: "Shree Balaji Decorators",
    businessType: "importer",
    city: "Delhi",
    state: "Delhi",
    gst: "07BALAJI9012H3Z1",
    approved: true,
    products: [
      {
        name: "Welcome Baby Decoration Kit",
        category: "baby-shower",
        pricePerUnit: 1980,
        unitLabel: "Set",
        moq: 2,
        quantityMultiple: 1,
        stock: 75,
        city: "Delhi",
        color: "Green/White",
        tags: ["new_arrival", "top_rated"],
        imgSeed: "welcomebaby",
        description: "Premium imported 'Welcome Baby' décor kit with neon sign and balloon garland.",
        slabs: [
          { minQty: 2, maxQty: 9, price: 1980 },
          { minQty: 10, maxQty: null, price: 1790 },
        ],
      },
      {
        name: "Happy Birthday Foil Banner (Rose Gold)",
        category: "birthday",
        pricePerUnit: 95,
        unitLabel: "Piece",
        moq: 25,
        quantityMultiple: 25,
        stock: 2000,
        city: "Delhi",
        color: "Rose Gold",
        material: "Foil",
        tags: ["fast_moving"],
        imgSeed: "hbdbanner",
        description: "Reusable rose-gold foil 'Happy Birthday' banner, premium thickness.",
        slabs: [
          { minQty: 25, maxQty: 99, price: 95 },
          { minQty: 100, maxQty: null, price: 75 },
        ],
      },
      {
        name: "Cake Topper Set (Assorted)",
        category: "cake-toppers",
        pricePerUnit: 260,
        unitLabel: "Pack",
        moq: 6,
        quantityMultiple: 6,
        stock: 50,
        city: "Delhi",
        tags: ["clearance"],
        imgSeed: "caketopper",
        description: "Clearance: assorted acrylic and glitter cake toppers, mixed designs.",
      },
      {
        name: "Pastel Theme Curtain Backdrop",
        category: "curtains",
        pricePerUnit: 340,
        unitLabel: "Piece",
        moq: 10,
        quantityMultiple: 5,
        stock: 260,
        city: "Delhi",
        color: "Pastel",
        material: "Satin",
        imgSeed: "pastelcurtain",
        description: "Soft pastel satin backdrop curtain for baby showers and pastel-theme parties.",
      },
    ],
  },
  {
    // Pending supplier — demonstrates the admin approval workflow.
    phone: "9000000013",
    companyName: "New Era Party Imports",
    businessType: "importer",
    city: "Ahmedabad",
    state: "Gujarat",
    gst: "24NEWERA3456J7Z2",
    approved: false,
    products: [],
  },
];

async function main() {
  console.log("Clearing existing data…");
  await clear();

  console.log("Creating categories…");
  const categoryBySlug = new Map<string, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const created = await prisma.category.create({
      data: { name: c.name, slug: c.slug, icon: c.icon, sortOrder: i },
    });
    categoryBySlug.set(c.slug, created.id);
  }

  console.log("Creating subscription plans…");
  const supplierPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Premium Supplier Plan",
      audience: "supplier",
      pricePaise: rupees(120000),
      interval: "yearly",
      features: JSON.stringify(["Unlimited products", "Leads & analytics", "WhatsApp campaigns"]),
    },
  });
  const customerPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Buyer Membership",
      audience: "customer",
      pricePaise: rupees(3000),
      interval: "monthly",
      features: JSON.stringify(["Verified suppliers", "AI search", "Advance booking"]),
    },
  });

  const yearAhead = new Date();
  yearAhead.setFullYear(yearAhead.getFullYear() + 1);
  const monthAhead = new Date();
  monthAhead.setMonth(monthAhead.getMonth() + 1);

  console.log("Creating suppliers and products…");
  for (const s of SUPPLIERS) {
    const user = await prisma.user.create({
      data: {
        phone: s.phone,
        name: s.companyName,
        role: "supplier",
        supplier: {
          create: {
            companyName: s.companyName,
            businessType: s.businessType,
            gstNumber: s.gst,
            city: s.city,
            state: s.state,
            warehouseLocation: `${s.city} Warehouse`,
            mobiles: JSON.stringify([s.phone]),
            kycStatus: s.approved ? "approved" : "submitted",
            planStatus: s.approved ? "active" : "inactive",
            verifiedBadges: s.approved
              ? JSON.stringify(["gst_verified", s.businessType])
              : "[]",
            trustScore: s.approved ? 80 + Math.floor(Math.random() * 20) : 0,
          },
        },
      },
      include: { supplier: true },
    });
    const supplierId = user.supplier!.id;

    if (s.approved) {
      await prisma.subscription.create({
        data: {
          planId: supplierPlan.id,
          supplierId,
          status: "active",
          periodEnd: yearAhead,
        },
      });
    }

    for (const p of s.products) {
      const categoryId = categoryBySlug.get(p.category)!;
      await prisma.product.create({
        data: {
          supplierId,
          categoryId,
          name: p.name,
          slug: slug(p.name, p.imgSeed),
          description: p.description,
          basePricePaise: rupees(p.pricePerUnit),
          gstPercent: p.gst ?? 18,
          moq: p.moq,
          quantityMultiple: p.quantityMultiple,
          stockQuantity: p.stock,
          unitLabel: p.unitLabel,
          serviceCity: p.city,
          material: p.material,
          color: p.color,
          status: p.stock > 0 ? "active" : "out_of_stock",
          tags: JSON.stringify(p.tags ?? []),
          viewCount: Math.floor(Math.random() * 1200),
          orderCount: Math.floor(Math.random() * 30),
          images: { create: [{ url: img(p.imgSeed), altText: p.name, sortOrder: 0 }] },
          priceSlabs: p.slabs?.length
            ? {
                create: p.slabs.map((sl) => ({
                  minQty: sl.minQty,
                  maxQty: sl.maxQty,
                  unitPricePaise: rupees(sl.price),
                })),
              }
            : undefined,
        },
      });
    }
  }

  console.log("Creating buyer and admin…");
  const customerUser = await prisma.user.create({
    data: {
      phone: "9000000001",
      name: "Shine Events",
      role: "customer",
      customer: {
        create: {
          shopName: "Shine Events",
          ownerName: "Rohan Mehta",
          gstNumber: "27SHINE1234E1Z9",
          businessCategory: "event_planner",
          city: "Mumbai",
          state: "Maharashtra",
          kycStatus: "approved",
          planStatus: "active",
          addresses: {
            create: [
              {
                type: "delivery",
                line1: "Shop 14, Party Market, Dadar West",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400028",
                isDefault: true,
                transportPreference: "VRL Logistics",
              },
            ],
          },
        },
      },
    },
    include: { customer: true },
  });
  await prisma.subscription.create({
    data: {
      planId: customerPlan.id,
      customerId: customerUser.customer!.id,
      status: "active",
      periodEnd: monthAhead,
    },
  });

  console.log("Creating a sample delivered order + review…");
  const blueKit = await prisma.product.findFirst({
    where: { name: "Balloon Decoration Kit (Blue Theme)" },
  });
  if (blueKit) {
    const qty = blueKit.moq;
    const unit = blueKit.basePricePaise;
    const subtotal = unit * qty;
    const gst = Math.round((subtotal * blueKit.gstPercent) / 100);
    const total = subtotal + gst;
    const order = await prisma.order.create({
      data: { customerId: customerUser.customer!.id, totalPaise: total, paymentStatus: "paid" },
    });
    const so = await prisma.supplierOrder.create({
      data: {
        orderId: order.id,
        supplierId: blueKit.supplierId,
        status: "delivered",
        subtotalPaise: subtotal,
        gstPaise: gst,
        totalPaise: total,
        items: {
          create: [
            {
              productId: blueKit.id,
              productName: blueKit.name,
              quantity: qty,
              unitPricePaise: unit,
              gstPercent: blueKit.gstPercent,
              lineTotalPaise: total,
            },
          ],
        },
      },
    });
    await prisma.invoice.create({
      data: { supplierOrderId: so.id, number: "KP-2026-000001", amountPaise: total, gstPaise: gst },
    });
    await prisma.review.create({
      data: {
        productId: blueKit.id,
        supplierId: blueKit.supplierId,
        customerId: customerUser.customer!.id,
        rating: 5,
        text: "Great quality and fast dispatch. Will reorder for our events.",
      },
    });
    await prisma.product.update({
      where: { id: blueKit.id },
      data: { ratingAvg: 5, ratingCount: 1, orderCount: { increment: 1 } },
    });
  }

  await prisma.rfq.create({
    data: {
      customerId: customerUser.customer!.id,
      title: "500 blue latex balloons for a wedding",
      detail: "Delivery to Mumbai by next week — need best wholesale price.",
      categoryId: categoryBySlug.get("balloons") ?? null,
      targetQty: 500,
    },
  });

  await prisma.user.create({
    data: { phone: "9000000099", name: "Kiwi Admin", role: "admin" },
  });

  // a couple of seed inquiries for the supplier dashboard
  const firstProduct = await prisma.product.findFirst({ where: { supplier: { city: "Mumbai" } } });
  if (firstProduct) {
    await prisma.inquiry.create({
      data: {
        customerId: customerUser.customer!.id,
        productId: firstProduct.id,
        supplierId: firstProduct.supplierId,
        message: "Can you do 100 sets for a wedding on the 20th? Best price please.",
        score: "hot",
      },
    });
    await prisma.product.update({
      where: { id: firstProduct.id },
      data: { inquiryCount: { increment: 1 } },
    });
  }

  console.log("Creating supplier stories…");
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const storySpecs: { product: string; caption: string; offer?: string; highlight?: boolean; img: string }[] = [
    { product: "Balloon Decoration Kit (Blue Theme)", caption: "New blue-theme arch just dropped! 🎈", offer: "15% off this week", img: "story-balloonblue" },
    { product: "Foil Curtain (Gold)", caption: "Our best-selling photo-booth backdrop ✨", highlight: true, img: "story-foilgold" },
    { product: "Oh Baby Decoration Combo (Blue)", caption: "Trending for baby showers this season 💙", offer: "Combo price", img: "story-ohbaby" },
    { product: "Welcome Baby Decoration Kit", caption: "Fresh imported stock — limited pieces!", offer: "Festival pre-booking open", img: "story-welcomebaby" },
    { product: "Diwali Décor Hanging Set", caption: "Diwali collection is live 🪔", highlight: true, img: "story-diwali" },
  ];
  for (const spec of storySpecs) {
    const product = await prisma.product.findFirst({ where: { name: spec.product } });
    if (!product) continue;
    await prisma.story.create({
      data: {
        supplierId: product.supplierId,
        type: spec.offer ? "offer" : "product",
        mediaUrl: img(spec.img),
        caption: spec.caption,
        linkedProductId: product.id,
        offerText: spec.offer,
        isHighlight: !!spec.highlight,
        expiresAt: in24h,
        viewCount: Math.floor(Math.random() * 400),
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    suppliers: await prisma.supplierProfile.count(),
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
  };
  console.log("Seed complete:", counts);
  console.log("\nLogin (OTP 123456):");
  console.log("  Buyer:    9000000001");
  console.log("  Supplier: 9000000010 (Party World Suppliers)");
  console.log("  Admin:    9000000099");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

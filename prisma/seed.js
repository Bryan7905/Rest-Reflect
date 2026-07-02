import 'dotenv/config';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  // Upsert a default User (UUID)
  const defaultUser = await prisma.user.upsert({
    where: { email: 'gf@sanctuary.com' },
    update: {},
    create: {
      email: 'gf@sanctuary.com',
      role: 'user'
    },
  });

  console.log(`Default User created/found: ${defaultUser.id}`);

  // Create admin user: admin@sanctuary.com / adminpass
  const adminPassword = await bcrypt.hash('adminpass', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sanctuary.com' },
    update: {
      role: 'admin'
    },
    create: {
      email: 'admin@sanctuary.com',
      password: adminPassword,
      role: 'admin'
    }
  });

  console.log(`Admin User created/found: ${adminUser.id}`);

  // Add some fallback quotes if they don't exist
  const quoteCount = await prisma.quote.count({
    where: { userId: defaultUser.id },
  });

  if (quoteCount === 0) {
    await prisma.quote.createMany({
      data: [
        {
          userId: defaultUser.id,
          bookTitle: "Quiet Moments",
          author: "Joena San Diego",
          quoteText: "You do not have to rush. God is preparing you in the quiet. He is not slow; He is just intentional.",
          personalNote: "A reminder when I feel pressured to perform."
        },
        {
          userId: defaultUser.id,
          bookTitle: "Quiet Moments",
          author: "Joena San Diego",
          quoteText: "Rest is not a waste of time. It is an act of trust. You are trusting that God can handle the things you leave behind.",
          personalNote: "Let it go, he has got you."
        },
        {
          userId: defaultUser.id,
          bookTitle: "Grace Found Me",
          author: "Joena San Diego",
          quoteText: "Your worth is not measured by your productivity. You are loved simply because you are His.",
          personalNote: "You are enough."
        }
      ]
    });
    console.log("Seeded Joena San Diego quotes into the bookshelf.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

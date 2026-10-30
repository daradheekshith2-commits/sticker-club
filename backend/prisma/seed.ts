import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { products } from '../../src/data/products.js';
import { collections } from '../../src/data/collections.js';

const db = new PrismaClient();

/**
 * Seeds the ACTUAL frontend catalogue, preserving original product ids and slugs.
 * Insert-only: never resets existing admin edits, inventory, or prices.
 * A product with no Inventory row is not stock-tracked; establish real stock
 * counts before accepting real purchases.
 */
async function seedCatalogue() {
  const categories = [
    { id: 'stickers', name: 'Stickers' },
    { id: 'posters', name: 'Posters' },
    ...collections.map(({ id, name }) => ({ id, name })),
  ];
  for (const category of categories) {
    await db.category.upsert({
      where: { id: category.id },
      create: category,
      update: { name: category.name },
    });
  }
  let created = 0;
  for (const product of products) {
    const existing = await db.product.findUnique({ where: { id: product.id }, select: { id: true } });
    if (!existing) {
      await db.product.create({
        data: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price.toFixed(2),
          active: product.status === 'demo',
          categories: {
            create: [product.category, ...product.collections].map(categoryId => ({ categoryId })),
          },
        },
      });
      created++;
    }
  }
  console.log('Catalogue seed: ' + created + ' new products, ' + products.length + ' frontend products inspected.');
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('Admin bootstrap skipped: set ADMIN_EMAIL and ADMIN_PASSWORD locally if needed.');
    return;
  }
  if (password.length < 12) throw Error('Admin password must contain at least 12 characters.');
  if (await db.user.findUnique({ where: { email } })) {
    console.log('Admin bootstrap skipped: account already exists; no privileges were changed.');
    return;
  }
  await db.user.create({
    data: {
      email,
      name: 'Store Administrator',
      passwordHash: await bcrypt.hash(password, 12),
      role: 'ADMIN',
    },
  });
  console.log('Bootstrap admin created; remove admin credentials from your environment.');
}

async function main() {
  await seedCatalogue();
  await seedAdmin();
}

main()
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await db.$disconnect(); });

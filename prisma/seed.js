const { PrismaClient } = require('@prisma/client');
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: hashedPassword,
          },
          // We're ignoring conflicts as before
          // However, Prisma's `create` method will handle conflicts automatically.
          // You can handle conflicts differently using Prisma's options.
          // For more information: https://www.prisma.io/docs/concepts/components/prisma-client/crud#options
          // skipDuplicates: true,
        });
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return insertedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    // Insert data into the "invoices" table
    const insertedInvoices = await Promise.all(
      invoices.map((invoice) =>
        prisma.invoice.create({
          data: {
            customerId: invoice.customer_id,
            amount: invoice.amount,
            status: invoice.status,
            date: invoice.date,
          },
          // skipDuplicates: true,
        }),
      ),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return insertedInvoices;
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map((customer) =>
        prisma.customer.create({
          data: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            imageUrl: customer.image_url,
          },
          // skipDuplicates: true,
        }),
      ),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);

    return insertedCustomers;
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    // Insert data into the "revenue" table
    const insertedRevenue = await Promise.all(
      revenue.map((rev) =>
        prisma.revenue.create({
          data: {
            month: rev.month,
            revenue: rev.revenue,
          },
          // skipDuplicates: true,
        }),
      ),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return insertedRevenue;
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
  } catch (error) {
    console.error(
      'An error occurred while attempting to seed the database:',
      error,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();

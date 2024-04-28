import { unstable_noStore as noCacheStore } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';

const prisma = new PrismaClient();

export async function fetchRevenue() {
  noCacheStore();
  try {
    console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await prisma.revenue.findMany();
    console.log('Data fetch completed after 3 seconds.');
    console.log(data);
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noCacheStore();
  try {
    const data = await prisma.invoice.findMany({
      select: {
        amount: true,
        customer: {
          select: {
            name: true,
            imageUrl: true,
            email: true,
          },
        },
        id: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    });

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    console.log('Data fetch completed after 3 seconds.');
    console.log('latestInvoices', latestInvoices);

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noCacheStore();
  try {
    const invoiceCount = await prisma.invoice.count();
    const customerCount = await prisma.customer.count();
    const invoiceStatus = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: {
          in: ['paid', 'pending'],
        },
      },
    });

    const totalPaidInvoices = formatCurrency(invoiceStatus._sum.amount ?? '0');
    const totalPendingInvoices = formatCurrency(
      invoiceStatus._sum.amount ?? '0',
    );

    return {
      numberOfCustomers: customerCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(query = '', currentPage = 1) {
  noCacheStore();
  // console.log('fetchFilteredInvoices params: ', query, currentPage);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        customerId: true,
        amount: true,
        date: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      // where: {
      //   OR: [
      //     { customer: { name: { contains: query } } },
      //     { customer: { email: { contains: query } } },
      //     { amount: { contains: query } },
      //     { date: { contains: query } },
      //     { status: { contains: query } },
      //   ],
      // },
      where: {
        OR: [
          query
            ? { customer: { name: { contains: query, mode: 'insensitive' } } }
            : {},
          query
            ? { customer: { email: { contains: query, mode: 'insensitive' } } }
            : {},
          // query ? { amount: { contains: query } } : {},
          // query ? { date: { contains: query } } : {},
          { status: { contains: query } },
        ],
      },
      orderBy: {
        date: 'desc',
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });
    console.log('FIltered Invoices: ', invoices);

    // invoices.forEach((invoice) => {
    //   invoice.date = invoice.date.toISOString(); // Convert to ISO string
    // });

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query = '') {
  noCacheStore();
  try {
    const count = await prisma.invoice.count({
      where: {
        OR: [
          { customer: { name: { contains: query } } },
          { customer: { email: { contains: query } } },
          // { amount: { contains: query } },
          // { date: { contains: query } },
          { status: { contains: query } },
        ],
      },
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id = '') {
  noCacheStore();
  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
      },
    });

    //* Commenting out because it is causing error.tsx to kick-in which catches all type of errors.
    //* But we want to handle this separately using not-found component instead.
    // if (!invoice) {
    //   throw new Error('Invoice not found.');
    // }

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  noCacheStore();
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query = '') {
  noCacheStore();
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        total_invoices: {
          select: {
            count: true,
          },
        },
        total_pending: {
          sum: {
            where: {
              status: 'pending',
            },
            amount: true,
          },
        },
        total_paid: {
          sum: {
            where: {
              status: 'paid',
            },
            amount: true,
          },
        },
      },
      where: {
        OR: [{ name: { contains: query } }, { email: { contains: query } }],
      },
      orderBy: {
        name: 'asc',
      },
      groupBy: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
    });

    const formattedCustomers = customers.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending.sum.amount ?? '0'),
      total_paid: formatCurrency(customer.total_paid.sum.amount ?? '0'),
    }));

    return formattedCustomers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email = '') {
  noCacheStore();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

//* Create Api:
export const createInvoiceIntoDB = async (invoice) => {
  try {
    const createdInvoice = await prisma.invoice.create({ data: invoice });
    return createdInvoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create invoice.');
  }
};

export const updateInvoiceIntoDB = async (invoice) => {
  try {
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        customerId: invoice.customerId,
        amount: invoice.amount,
        status: invoice.status,
      },
    });
    return updatedInvoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update invoice.');
  }
};

export const deleteInvoiceFromDB = async (id) => {
  try {
    const deletedInvoice = await prisma.invoice.delete({ where: { id } });
    return deletedInvoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete invoice.');
  }
};

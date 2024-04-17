'use server';

import { z } from 'zod';
import {
  createInvoiceIntoDB,
  deleteInvoiceFromDB,
  updateInvoiceIntoDB,
} from './data_prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  // status: z.string() as z.ZodType<'pending' | 'paid'>,
  // status: z.discriminatedUnion('status', [
  //     z.literal('pending'),
  //     z.literal('paid'),
  // ]),
  // status: z.switch((schema) => ({
  //     pending: schema.literal('pending'),
  //     paid: schema.literal('paid'),
  //   })),
  status: z.string().refine((value) => value === 'pending' || value === 'paid'),
  amount: z.coerce.number(),
  date: z.date(),
});

const CreateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

export async function createInvoice(formData: FormData) {
  const invoiceObj = CreateInvoice.parse(Object.fromEntries(formData));
  const amountInCents = invoiceObj.amount * 100;
  const formattedDate = new Date();

  await createInvoiceIntoDB({
    ...invoiceObj,
    amount: amountInCents,
    date: formattedDate,
  });

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

export async function updateInvoice(id: string, formData: FormData) {
  const invoiceObj = UpdateInvoice.parse(Object.fromEntries(formData));
  const amountInCents = invoiceObj.amount * 100;
  // const formattedDate = new Date();

  await updateInvoiceIntoDB({
    ...invoiceObj,
    id,
    amount: amountInCents,
    // date: formattedDate
  });

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await deleteInvoiceFromDB(id);

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

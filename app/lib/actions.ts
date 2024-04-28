//* We make sure this file is only executed on the server and hence are server-actions
//* Server-actions are actions (database operations or API calls) that are executed on the server
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

//* Create CreateInvoice Schema from FormSchema by omitting (excluding) id and date
const CreateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

//* Create UpdateInvoice Schema from FormSchema by omitting (excluding) id and date
const UpdateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

export async function createInvoice(formData: FormData) {
  const invoiceObj = CreateInvoice.parse(Object.fromEntries(formData));
  const amountInCents = invoiceObj.amount * 100;
  const formattedDate = new Date();

  try {
    await createInvoiceIntoDB({
      ...invoiceObj,
      amount: amountInCents,
      date: formattedDate,
    });
    //* Revalidate and Redirect are only reachable if the create was successful and try is executed successfully
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.log('DETAILED CREATE INVOICE ERROR: ', error);
    return new Error('Database Error: Failed to create invoice.');
  }

  //* We need to keep redirect outside the try-catch block because
  //* the redirect works by throwing an error which would be caught by the catch block
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const invoiceObj = UpdateInvoice.parse(Object.fromEntries(formData));
  const amountInCents = invoiceObj.amount * 100;

  try {
    await updateInvoiceIntoDB({
      ...invoiceObj,
      id,
      amount: amountInCents,
    });
    //* Revalidate and Redirect are only reachable if the update was successful and try is executed successfully
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.log('DETAILED UPDATE INVOICE ERROR: ', error);
    return new Error('Database Error: Failed to update invoice.');
  }
  //* We need to keep redirect outside the try-catch block because
  //* the redirect works by throwing an error which would be caught by the catch block
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await deleteInvoiceFromDB(id);

    //* Revalidate and Redirect are only reachable if the delete was successful and try is executed successfully
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.log('DETAILED DELETE INVOICE ERROR: ', error);
    return new Error('Database Error: Failed to delete invoice.');
  }
  //* We need to keep redirect outside the try-catch block because
  //* the redirect works by throwing an error which would be caught by the catch block
  redirect('/dashboard/invoices');
}

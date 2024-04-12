import { Suspense } from 'react';

import CardWrapper, { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import {
  CardSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from '../../ui/skeletons';

//* db services
// import {
//   fetchLatestInvoices,
//   // fetchRevenue,
//   fetchCardData,
// } from '@/app/lib/data_prisma'; //* Removing to make these db services to be suspense loaded

export default async function Page() {
  // const revenue = await fetchRevenue(); //* Removing to make this fetchRevenue to be suspense loaded
  // const latestInvoices = await fetchLatestInvoices(); //* Removing to make this fetchLatestInvoices to be suspense loaded
  // const {
  //   totalPaidInvoices,
  //   totalPendingInvoices,
  //   numberOfInvoices,
  //   numberOfCustomers,
  // } = await fetchCardData(); //* Removing to make this fetchCardData to be suspense loaded

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}

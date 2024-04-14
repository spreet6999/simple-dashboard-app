'use client';

// import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { debounceCallback } from '../lib/utils';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  //? Since we are using the URL query to send the search state to the backend we don't need a dedicated react state as of now
  // const [searchQuery, setSearchQuery] = useState(
  //   searchParams.get('query')?.toString() || '',
  // );

  const handleSearch = debounceCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchQuery = e.target.value;
      console.log(searchQuery);
      const params = new URLSearchParams(searchParams);
      //* Reset page to 1 whenever user searches for a new query
      params.set('page', '1');
      if (searchQuery) {
        params.set('query', searchQuery);
      } else {
        params.delete('query');
      }
      replace(`${pathname}?${params.toString()}`);
      //? Since we are using the URL query to send the search state to the backend we don't need a dedicated react state as of now
      // setSearchQuery(searchQuery);
    },
    300,
  );

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={handleSearch}
        //? Uncontrolled value state is managed by native html
        defaultValue={searchParams.get('query')?.toString() || ''}

        //? Controlled ex:
        //? Since we are using the URL query to send the search state to the backend we don't need a dedicated react state as of now
        // value={searchQuery}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}

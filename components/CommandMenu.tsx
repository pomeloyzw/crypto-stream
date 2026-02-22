'use client';

import { useRouter } from 'next/navigation';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandLoading } from 'cmdk';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchCoins } from '@/lib/coingecko.actions';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 500);
  const searchRequestIdRef = useRef<number>(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setResults([]);
        setQuery('');
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      const requestId = ++searchRequestIdRef.current;
      setLoading(true);
      try {
        const coins = await searchCoins(debouncedQuery);
        // Only update state if this is still the most recent request
        if (requestId === searchRequestIdRef.current) {
          setResults(coins.slice(0, 5));
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        // Only clear loading state if this is the most recent request
        if (requestId === searchRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Mock data for now - in a real app this would fetch from an API or context
  const suggestedCoins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  ];

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    setResults([]);
    setQuery('');
    command();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0F1115] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <Command className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-transparent text-white">
          <div className="flex items-center border-b border-white/10 px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              autoFocus
              placeholder="Search coins..."
              value={query}
              onValueChange={setQuery}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            {loading && <CommandLoading className="py-6 text-center text-sm text-gray-500">Searching...</CommandLoading>}
            {!loading && results.length === 0 && (
              <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                No results found.
              </CommandEmpty>
            )}

            {query ? (
              <CommandGroup heading="Search Results" className="overflow-hidden p-1 text-gray-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500">
                {results.map((coin) => (
                  <CommandItem
                    key={coin.id}
                    value={coin.id}
                    onSelect={() => {
                      runCommand(() => router.push(`/coins/${coin.id}`));
                    }}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white"
                  >
                    <div className="mr-2 h-5 w-5 shrink-0 rounded-full overflow-hidden relative">
                      <Image src={coin.thumb || '/placeholder.png'} alt={coin.name} fill sizes="20px" className="object-cover" />
                    </div>
                    <span className="font-medium text-white">{coin.name}</span>
                    <span className="ml-2 text-gray-500">{coin.symbol}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup heading="Suggestions" className="overflow-hidden p-1 text-gray-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500">
                {suggestedCoins.map((coin) => (
                  <CommandItem
                    key={coin.id}
                    value={coin.id}
                    onSelect={() => {
                      runCommand(() => router.push(`/coins/${coin.id}`));
                    }}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white"
                  >
                    <span className="font-medium text-white">{coin.name}</span>
                    <span className="ml-2 text-gray-500">{coin.symbol}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Navigation" className="overflow-hidden p-1 text-gray-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500">
              <CommandItem
                value="home"
                onSelect={() => runCommand(() => router.push('/'))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white"
              >
                <span>Home</span>
              </CommandItem>
              <CommandItem
                value="all-coins"
                onSelect={() => runCommand(() => router.push('/coins'))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white"
              >
                <span>All Coins</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
};

export default CommandMenu;

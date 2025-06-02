"use client";

import type { LocationSearchResult } from "@/app/actions/search-locations";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchLocations } from "@/app/actions/search-locations";
import { Heart, MapPin, X } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Handle search
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchLocations(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  // Handle clicking outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle add to favorites
  const handleAddToFavorites = (locationId: number) => {
    window.open(
      `https://app.eboxsecure.com/favorites?addToFavorite=${locationId}`,
      "_blank",
    );
  };

  return (
    <div className="relative isolate overflow-hidden bg-background">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/30 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <Container className="py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Secure Package Delivery for Your Business
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Protect your packages from theft while getting earlier access and
            unlimited capacity for high-volume deliveries.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <div
              className="relative flex-1 sm:max-w-md"
              ref={searchContainerRef}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-foreground ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Find locations near you..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setShowResults(false);
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-background shadow-lg">
                  {isLoading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul className="py-1">
                      {searchResults.map((location) => (
                        <li
                          key={location.id}
                          className="px-3 py-2 hover:bg-muted"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium text-foreground">
                                {location.name}
                              </div>
                              <div className="truncate text-sm text-muted-foreground">
                                {location.address}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-3 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToFavorites(location.id);
                              }}
                            >
                              <Heart className="mr-1 h-3 w-3" />
                              Add to favorites
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No locations found
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <Button className="sm:flex-none">Search</Button>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="https://app.eboxsecure.com">Go to app</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

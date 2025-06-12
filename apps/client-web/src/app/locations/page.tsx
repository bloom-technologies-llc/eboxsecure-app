"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Heart, MapPin, MoreHorizontal } from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Card, CardContent } from "@ebox/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Input } from "@ebox/ui/input";

function LocationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [locationToAdd, setLocationToAdd] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: favorites, refetch: refetchFavorites } =
    api.favorites.getFavorites.useQuery();
  const { data: locationDetails } = api.favorites.getLocationDetails.useQuery(
    { locationId: locationToAdd! },
    { enabled: !!locationToAdd },
  );
  const { data: searchResults } = api.favorites.searchLocations.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 },
  );

  const addFavoriteMutation = api.favorites.addFavorite.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      setLocationToAdd(null);
      refetchFavorites();
      toast({
        title: "Success",
        description: "Location added to favorites!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = api.favorites.removeFavorite.useMutation({
    onSuccess: () => {
      refetchFavorites();
      toast({
        title: "Success",
        description: "Location removed from favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setPrimaryMutation = api.favorites.setPrimary.useMutation({
    onSuccess: () => {
      refetchFavorites();
      toast({
        title: "Success",
        description: "Primary location updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const addToFavoriteParam = searchParams.get("addToFavorite");
    if (addToFavoriteParam) {
      const locationId = parseInt(addToFavoriteParam);
      if (!isNaN(locationId)) {
        setLocationToAdd(locationId);
        setShowAddModal(true);

        // Clean up URL without triggering navigation
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("addToFavorite");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, [searchParams]);

  const handleAddFavorite = (locationId: number, event?: React.MouseEvent) => {
    // Prevent Link navigation when clicking the button
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setLocationToAdd(locationId);
    setShowAddModal(true);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">EboxSecure Locations</h1>

        {/* Search Component */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="pl-10"
              />
            </div>
          </div>

          {showResults && searchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-background shadow-lg">
              {searchResults.map((location) => (
                <Link href={`/locations/${location.id}`} key={location.id}>
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium">{location.name}</h4>
                      <p className="truncate text-sm text-muted-foreground">
                        {location.address}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={location.isFavorited ? "secondary" : "outline"}
                      disabled={location.isFavorited}
                      onClick={(event) => handleAddFavorite(location.id, event)}
                      className="ml-3 flex-shrink-0"
                    >
                      <Heart className="mr-1 h-3 w-3" />
                      {location.isFavorited ? "Favorited" : "Add"}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Favorite Locations</h2>
        {favorites?.length === 0 ? (
          <p className="text-muted-foreground">
            No favorite locations yet. Search and add some above!
          </p>
        ) : (
          favorites?.map((favorite) => (
            <Card
              key={favorite.id}
              className={favorite.isPrimary ? "border-primary" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate font-medium">
                        {favorite.location.name}
                      </h3>
                      {favorite.isPrimary && (
                        <Badge variant="secondary">Primary</Badge>
                      )}
                    </div>
                    <p className="mb-1 truncate text-sm text-muted-foreground">
                      {favorite.location.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {format(new Date(favorite.createdAt), "PPP")}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/locations/${favorite.location.id}`)
                        }
                      >
                        View Details
                      </DropdownMenuItem>
                      {!favorite.isPrimary && (
                        <DropdownMenuItem
                          onClick={() =>
                            setPrimaryMutation.mutate({
                              locationId: favorite.location.id,
                            })
                          }
                        >
                          Set as Primary
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          removeMutation.mutate({
                            locationId: favorite.location.id,
                          })
                        }
                      >
                        Remove from Favorites
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Favorite Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Favorites</DialogTitle>
            <DialogDescription>
              Add {locationDetails?.name} to your favorite locations?
            </DialogDescription>
          </DialogHeader>

          {locationDetails && (
            <div className="py-4">
              <h4 className="font-medium">{locationDetails.name}</h4>
              <p className="text-sm text-muted-foreground">
                {locationDetails.address}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                locationDetails &&
                addFavoriteMutation.mutate({ locationId: locationDetails.id })
              }
              disabled={addFavoriteMutation.isPending}
            >
              {addFavoriteMutation.isPending ? "Adding..." : "Add to Favorites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Suspense fallback={<div className="container py-8">Loading...</div>}>
      <LocationsContent />
    </Suspense>
  );
}

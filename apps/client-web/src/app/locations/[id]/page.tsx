"use client";

import { useParams } from "next/navigation";
import { env } from "@/env";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Clock, DollarSign, Heart, MapPin, Package } from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Skeleton } from "@ebox/ui/skeleton";

function GoogleMap({
  address,
  name,
  className = "",
}: {
  address: string;
  name: string;
  className?: string;
}) {
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${env.NEXT_PUBLIC_MAPS_EMBED_API_KEY}&q=${encodeURIComponent(address)}`;

  return (
    <div className={`overflow-hidden rounded-lg ${className}`}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
        src={mapSrc}
        allowFullScreen
        loading="lazy"
        title={`Map of ${name}`}
      />
    </div>
  );
}

export default function LocationDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const locationId = parseInt(params.id as string);

  const {
    data: location,
    isLoading,
    error,
    refetch,
  } = api.favorites.getLocationDetails.useQuery(
    { locationId },
    { enabled: !isNaN(locationId) },
  );

  const addFavoriteMutation = api.favorites.addFavorite.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location added to favorites!",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = api.favorites.removeFavorite.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Location removed from favorites!",
      });
      refetch();
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
      toast({
        title: "Success",
        description: "Set as primary location!",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isNaN(locationId)) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Invalid Location
          </h1>
          <p className="mt-2 text-muted-foreground">
            The location ID provided is not valid.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Skeleton className="mb-4 h-8 w-3/4" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-6 h-4 w-2/3" />

            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Location Not Found
          </h1>
          <p className="mt-2 text-muted-foreground">
            The location you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{location.name}</h1>
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">{location.address}</p>
              </div>
            </div>

            {location.isFavorited && location.isPrimary && (
              <Badge variant="secondary" className="ml-4">
                Primary
              </Badge>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Storage Capacity</p>
                    <p className="text-2xl font-bold">
                      {location.storageCapacity}
                    </p>
                    <p className="text-xs text-muted-foreground">packages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Location Type</p>
                    <p className="text-lg font-semibold capitalize">
                      {location.locationType.toLowerCase()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Actions */}
          <div className="mb-6 flex gap-2">
            {!location.isFavorited ? (
              <Button
                onClick={() => addFavoriteMutation.mutate({ locationId })}
                disabled={addFavoriteMutation.isPending}
              >
                <Heart className="mr-2 h-4 w-4" />
                {addFavoriteMutation.isPending
                  ? "Adding..."
                  : "Add to Favorites"}
              </Button>
            ) : (
              <>
                {!location.isPrimary && (
                  <Button
                    variant="outline"
                    onClick={() => setPrimaryMutation.mutate({ locationId })}
                    disabled={setPrimaryMutation.isPending}
                  >
                    {setPrimaryMutation.isPending
                      ? "Setting..."
                      : "Set as Primary"}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => removeFavoriteMutation.mutate({ locationId })}
                  disabled={removeFavoriteMutation.isPending}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {removeFavoriteMutation.isPending
                    ? "Removing..."
                    : "Remove from Favorites"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div>
          <GoogleMap
            address={location.address}
            name={location.name}
            className="h-64 rounded-lg"
          />
        </div>
      </div>

      {location.orders && location.orders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Your Recent Orders</h2>
          <div className="grid gap-4">
            {location.orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">
                        Order #{order.vendorOrderId}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                        {order.deliveredDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Delivered{" "}
                              {format(new Date(order.deliveredDate), "PPP")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={order.pickedUpAt ? "secondary" : "outline"}>
                      {order.pickedUpAt ? "Picked Up" : "Ready for Pickup"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

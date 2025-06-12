import { notFound } from "next/navigation";

import LocationCommentFormContainer from "~/app/_components/locations/location-comment-form-container";
import LocationCommentsSection from "~/app/_components/locations/location-comments-section";
import LocationDetailsCard from "~/app/_components/locations/location-details-card";
import LocationDetailsLayout from "~/app/_components/locations/location-details-layout";
import LocationHeader from "~/app/_components/locations/location-header";
import { api } from "~/trpc/server";

interface LocationDetailProps {
  params: {
    locationId: string;
  };
  searchParams: {
    highlight?: string;
  };
}

export default async function LocationDetail({
  params,
  searchParams,
}: LocationDetailProps) {
  const { locationId } = params;
  const highlightedCommentId = searchParams.highlight || null;

  try {
    const [locationDetails, locationComments] = await Promise.all([
      api.locations.getLocationDetails({
        locationId: parseInt(locationId),
      }),
      api.locations.locationComments.query({
        locationId: parseInt(locationId),
      }),
    ]);

    if (!locationDetails) {
      notFound();
    }

    return (
      <LocationDetailsLayout
        header={
          <div className="my-6 flex items-center gap-x-2">
            <LocationHeader location={locationDetails} />
          </div>
        }
        detailPanels={<LocationDetailsCard location={locationDetails} />}
      >
        <div className="flex flex-col gap-y-6">
          <LocationCommentFormContainer locationId={locationDetails.id} />

          <LocationCommentsSection
            comments={locationComments || []}
            highlightedCommentId={highlightedCommentId}
            locationId={locationDetails.id}
          />
        </div>
      </LocationDetailsLayout>
    );
  } catch (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Location not found or access denied</h1>
      </div>
    );
  }
}

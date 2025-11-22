import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { BusinessListing } from "@/types/listing";

interface ListingApprovalCardProps {
  listing: BusinessListing;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function ListingApprovalCard({
  listing,
  onApprove,
  onReject,
  onDelete,
  onView,
}: ListingApprovalCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full relative bg-muted">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant={listing.status === "pending" ? "secondary" : "default"}
          >
            {listing.status}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {listing.title}
            </h3>
            <p className="text-sm text-muted-foreground">{listing.category}</p>
          </div>
          <p className="font-bold text-primary">
            {formatCurrency(listing.financials.askingPrice)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-medium">
              {formatCurrency(listing.financials.revenue)}/yr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profit:</span>
            <span className="font-medium">
              {formatCurrency(listing.financials.profit)}/yr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seller:</span>
            <span className="font-medium">
              {listing.sellerId?.profile?.name ||
                listing.sellerId?.email ||
                "Unknown"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(listing._id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
        {listing.status === "pending" && (
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(listing._id)}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onReject(listing._id)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        )}
        {listing.status !== "pending" && (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(listing._id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

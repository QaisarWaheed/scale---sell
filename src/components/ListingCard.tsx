import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, MapPin, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface ListingCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  revenue: number;
  category: string;
  location: string;
  verified?: boolean;
  imageUrl?: string;
}

export const ListingCard = ({
  id,
  title,
  description,
  price,
  revenue,
  category,
  location,
  verified = false,
  imageUrl,
}: ListingCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="aspect-video w-full bg-muted relative overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <TrendingUp className="h-12 w-12 text-primary/20" />
          </div>
        )}
        {verified && (
          <Badge className="absolute top-3 right-3 bg-white/90 text-primary hover:bg-white shadow-sm backdrop-blur-sm">
            Verified
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 min-h-[2.5rem]">
          {description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
              Asking Price
            </p>
            <p className="font-bold text-lg text-primary">
              ${price.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
              Revenue
            </p>
            <p className="font-semibold text-lg flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              {revenue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          asChild
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
        >
          <Link to={`/listing/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

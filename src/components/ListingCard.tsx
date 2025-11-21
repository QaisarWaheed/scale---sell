import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="aspect-video w-full bg-muted relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
            <TrendingUp className="h-12 w-12 text-primary-foreground/50" />
          </div>
        )}
        {verified && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
            Verified
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge variant="secondary">{category}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {description}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Asking Price</p>
            <p className="font-bold text-lg text-primary">
              ${price.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Annual Revenue</p>
            <p className="font-semibold text-lg flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-secondary" />
              {revenue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
          <Link to={`/listing/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

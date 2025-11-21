import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [searchTerm, category]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/listings", {
        params: {
          search: searchTerm,
          category: category === "all" ? undefined : category,
        },
      });
      setListings(res.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Browse Businesses
            </h1>
            <p className="text-muted-foreground">
              Discover verified, revenue-generating businesses ready for
              acquisition
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="Food & Beverage">
                    Food & Beverage
                  </SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Health & Fitness">
                    Health & Fitness
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="any">
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="0-500k">$0 - $500K</SelectItem>
                  <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                  <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                  <SelectItem value="5m+">$5M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <div className="ml-auto text-sm text-muted-foreground">
                {listings.length} businesses found
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg border shadow-sm h-96 animate-pulse"
                >
                  <div className="aspect-video w-full bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <ListingCard
                  key={listing._id}
                  id={listing._id}
                  title={listing.title}
                  description={listing.description}
                  price={listing.financials.askingPrice}
                  revenue={listing.financials.revenue}
                  category={listing.category}
                  location={listing.location}
                  verified={listing.status === "approved"}
                  // imageUrl={listing.images[0]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  No businesses found
                </h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any businesses matching your criteria. Try
                  adjusting your filters or search terms.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button asChild>
                    <a href="/contact">Contact Support</a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="default">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

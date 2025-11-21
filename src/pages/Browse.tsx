import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

// Mock data
const mockListings = [
  {
    id: "1",
    title: "E-Commerce Fashion Store",
    description: "Profitable online fashion boutique with 10K+ monthly customers and strong brand presence",
    price: 450000,
    revenue: 850000,
    category: "E-Commerce",
    location: "California, USA",
    verified: true,
  },
  {
    id: "2",
    title: "SaaS Project Management Tool",
    description: "Growing B2B SaaS with 500+ paying customers and 95% retention rate",
    price: 1200000,
    revenue: 300000,
    category: "SaaS",
    location: "Remote",
    verified: true,
  },
  {
    id: "3",
    title: "Coffee Shop Chain",
    description: "3 premium locations in downtown area with loyal customer base and consistent growth",
    price: 800000,
    revenue: 1200000,
    category: "Food & Beverage",
    location: "New York, USA",
    verified: true,
  },
  {
    id: "4",
    title: "Digital Marketing Agency",
    description: "Full-service agency with recurring clients and strong industry reputation",
    price: 350000,
    revenue: 600000,
    category: "Services",
    location: "Texas, USA",
    verified: false,
  },
  {
    id: "5",
    title: "Mobile App Development Studio",
    description: "Specialized in fintech apps with 20+ successful projects and recurring contracts",
    price: 550000,
    revenue: 750000,
    category: "Technology",
    location: "Florida, USA",
    verified: true,
  },
  {
    id: "6",
    title: "Fitness Studio Franchise",
    description: "Successful franchise location with equipment and established member base",
    price: 275000,
    revenue: 450000,
    category: "Health & Fitness",
    location: "Colorado, USA",
    verified: false,
  },
];

export default function Browse() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Businesses</h1>
            <p className="text-muted-foreground">
              Discover verified, revenue-generating businesses ready for acquisition
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
                  />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="health">Health & Fitness</SelectItem>
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
                {mockListings.length} businesses found
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled>Previous</Button>
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

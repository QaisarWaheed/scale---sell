import { useEffect, useState, useCallback } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageContainer } from "@/components/layouts/PageContainer";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterPanel } from "@/components/ui/filter-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { EmptyState } from "@/components/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { getListings } from "@/lib/listingApi";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BusinessListing, ListingQueryParams } from "@/types";

export default function Browse() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("investor");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata.role || "investor");
      }
      setAuthLoading(false);
    };

    checkUser();
  }, []);

  if (authLoading) {
    return <LoadingSpinner centered />;
  }

  if (user) {
    return (
      <DashboardLayout
        role={role}
        userEmail={user.email}
        title="Browse Businesses"
        subtitle="Discover verified, revenue-generating businesses ready for acquisition"
      >
        <BrowseContent />
      </DashboardLayout>
    );
  }

  return (
    <PageLayout>
      <PageContainer className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Browse Businesses
          </h1>
          <p className="text-muted-foreground">
            Discover verified, revenue-generating businesses ready for
            acquisition
          </p>
        </div>
        <BrowseContent />
      </PageContainer>
    </PageLayout>
  );
}

function BrowseContent() {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("any");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params: ListingQueryParams = {
        search: searchTerm,
        category: category === "all" ? undefined : category,
      };

      if (priceRange !== "any") {
        if (priceRange === "0-500k") {
          params.minPrice = 0;
          params.maxPrice = 500000;
        } else if (priceRange === "500k-1m") {
          params.minPrice = 500000;
          params.maxPrice = 1000000;
        } else if (priceRange === "1m-5m") {
          params.minPrice = 1000000;
          params.maxPrice = 5000000;
        } else if (priceRange === "5m+") {
          params.minPrice = 5000000;
        }
      }

      const data = await getListings(params);
      setListings(data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, priceRange]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <>
      {/* Filters */}
      <FilterPanel
        resultsCount={listings.length}
        onClearFilters={() => {
          setSearchTerm("");
          setCategory("all");
          setPriceRange("any");
        }}
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <SearchBar
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="E-Commerce">E-Commerce</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Price</SelectItem>
              <SelectItem value="0-500k">Rs. 0 - 5 Cr</SelectItem>
              <SelectItem value="500k-1m">Rs. 5 Cr - 10 Cr</SelectItem>
              <SelectItem value="1m-5m">Rs. 10 Cr - 50 Cr</SelectItem>
              <SelectItem value="5m+">Rs. 50 Cr+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterPanel>

      {/* Listings Grid */}
      {loading ? (
        <LoadingSkeleton variant="card" count={6} className="mb-8" />
      ) : listings.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {listings.map((listing) => (
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
        <EmptyState
          icon={Search}
          title="No businesses found"
          description="We couldn't find any businesses matching your criteria. Try adjusting your filters or search terms."
          variant="no-results"
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearchTerm("");
              setCategory("all");
              setPriceRange("any");
            },
            variant: "outline",
          }}
        />
      )}

      {/* Pagination */}
      {!loading && listings.length > 0 && (
        <SimplePagination
          currentPage={currentPage}
          totalPages={Math.ceil(listings.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      )}
    </>
  );
}

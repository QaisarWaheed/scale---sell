import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getListingById } from "@/lib/listingApi";
import { toggleSavedListing, getSavedListings } from "@/lib/userApi";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  MapPin,
  TrendingUp,
  Users,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initiateTransaction } from "@/lib/escrowApi";
import { getErrorMessage } from "@/lib/utils";
import { BusinessListing } from "@/types";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("investor");
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get User
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setRole(session.user.user_metadata.role || "investor");

          // Check if saved
          if (id) {
            const savedListings = await getSavedListings();
            const isSavedListing = savedListings.some(
              (l: BusinessListing | string) =>
                typeof l === "string" ? l === id : l._id === id
            );
            setIsSaved(isSavedListing);
          }
        }

        // Get Listing
        if (id) {
          const data = await getListingById(id);
          setListing(data);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast({
          title: "Error",
          description: "Failed to load listing details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleStartEscrow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!listing) return;

    try {
      const transaction = await initiateTransaction(
        listing._id,
        listing.financials.askingPrice
      );
      toast({
        title: "Success",
        description: "Escrow transaction initiated!",
      });
      navigate(`/dashboard/escrow/${transaction._id}`);
    } catch (error) {
      console.error("Error starting escrow:", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!listing) return;

    try {
      setSaveLoading(true);
      await toggleSavedListing(listing._id);
      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Removed from saved" : "Saved to dashboard",
        description: isSaved
          ? "Listing removed from your saved items."
          : "Listing saved to your dashboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved status.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered />;
  }

  if (!listing) {
    return (
      <DashboardLayout
        role={role}
        userEmail={user?.email}
        userName={user?.user_metadata?.name}
        title="Listing Not Found"
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Listing not found</h2>
          <Button variant="link" onClick={() => navigate("/browse")}>
            Back to Browse
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role={role}
      userEmail={user?.email}
      userName={user?.user_metadata?.name}
      title="Listing Details"
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" className="pl-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {role === "investor" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSave}
            disabled={saveLoading}
          >
            <Heart
              className={`mr-2 h-4 w-4 ${
                isSaved ? "fill-primary text-primary" : ""
              }`}
            />
            {isSaved ? "Saved" : "Save Listing"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </div>
                  <Badge variant="secondary">{listing.category}</Badge>
                  {listing.status === "approved" && (
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-600"
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {listing.images && listing.images.length > 0 ? (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-3">
                About this Business
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Year Established
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5 text-primary" />
                  {listing.details?.yearEstablished || "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5 text-primary" />
                  {listing.details?.employees || "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Asking Price
                </p>
                <p className="text-3xl font-bold text-primary">
                  ${listing.financials.askingPrice.toLocaleString()}
                </p>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Annual Revenue</span>
                  <span className="font-semibold">
                    ${listing.financials.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Annual Profit</span>
                  <span className="font-semibold text-green-600">
                    ${listing.financials.profit.toLocaleString()}
                  </span>
                </div>
              </div>

              {role === "investor" && (
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleStartEscrow}
                >
                  Start Acquisition
                </Button>
              )}
              {role === "seller" &&
                user?.id === listing.sellerId.supabaseId && (
                  <Button
                    className="w-full mt-6"
                    variant="outline"
                    onClick={() => navigate(`/dashboard?tab=listings`)}
                  >
                    Manage Listing
                  </Button>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {listing.sellerId?.profile?.name?.[0] || "S"}
                </div>
                <div>
                  <p className="font-medium">
                    {listing.sellerId?.profile?.name || "Seller"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verified Seller
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/dashboard?tab=messages")}
              >
                Contact Seller
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

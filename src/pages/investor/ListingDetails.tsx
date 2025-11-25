import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getListingById } from "@/lib/listingApi";
import { toggleSavedListing, getSavedListings } from "@/lib/userApi";
import { startConversation } from "@/lib/messageApi";
import { getMyOffers } from "@/lib/offerApi";
import { MakeOfferDialog } from "@/components/dialogs/MakeOfferDialog";
import { InvestmentOfferDialog } from "@/components/dialogs/InvestmentOfferDialog";
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
  MessageSquare,
  Briefcase,
  PieChart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusinessListing, Offer } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatAmount } = useCurrency();
  const [listing, setListing] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("investor");
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [existingOffer, setExistingOffer] = useState<Offer | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get User
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setRole(
            (session.user.user_metadata.role || "investor").toLowerCase()
          );

          // Check if saved
          if (id) {
            const savedListings = await getSavedListings();
            const isSavedListing = savedListings.some(
              (l: BusinessListing | string) =>
                typeof l === "string" ? l === id : l._id === id
            );
            setIsSaved(isSavedListing);

            // Check if offer exists
            if (session.user.user_metadata.role === "investor") {
              const offers = await getMyOffers();
              const offer = offers.find(
                (o) =>
                  (typeof o.businessId === "string"
                    ? o.businessId
                    : o.businessId._id) === id
              );
              if (offer) setExistingOffer(offer);
            }
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

  const handleContactSeller = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!listing) return;

    try {
      const sellerId =
        typeof listing.sellerId === "string"
          ? listing.sellerId
          : listing.sellerId._id;
      await startConversation(listing._id, sellerId);
      navigate("/dashboard?tab=messages");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        role={role}
        userEmail={user?.email}
        userName={user?.user_metadata?.name}
        title="Listing Details"
      >
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="mb-4">
                <Skeleton className="h-10 w-3/4 mb-2" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="aspect-video w-full rounded-lg mb-6" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
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

  const isInvestment =
    listing.listingType === "investment" || listing.listingType === "both";
  const isSale =
    listing.listingType === "sale" || listing.listingType === "both";

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
                  {isInvestment && (
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                      Investment Opportunity
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

            {isInvestment && listing.investmentOptions && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">
                  Investment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Investment Range
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-semibold">
                        {listing.investmentOptions.minInvestment
                          ? formatAmount(
                              listing.investmentOptions.minInvestment
                            )
                          : "N/A"}{" "}
                        -{" "}
                        {listing.investmentOptions.maxInvestment
                          ? formatAmount(
                              listing.investmentOptions.maxInvestment
                            )
                          : "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Offering
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-1">
                        {listing.investmentOptions.equityOffered && (
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">
                              {listing.investmentOptions.equityOffered}% Equity
                            </span>
                          </div>
                        )}
                        {listing.investmentOptions.revenueShareOffered && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-semibold">
                              {listing.investmentOptions.revenueShareOffered}%
                              Rev Share
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {listing.investmentOptions.investmentPurpose && (
                  <div className="mt-4 bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Investment Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      {listing.investmentOptions.investmentPurpose}
                    </p>
                  </div>
                )}
              </div>
            )}
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
              {isSale && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Asking Price
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatAmount(listing.financials.askingPrice)}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Annual Revenue</span>
                  <span className="font-semibold">
                    {formatAmount(listing.financials.revenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Annual Profit</span>
                  <span className="font-semibold text-green-600">
                    {formatAmount(listing.financials.profit)}
                  </span>
                </div>
              </div>

              {role === "investor" && (
                <div className="space-y-3 mt-6">
                  {isSale && (
                    <>
                      {existingOffer ? (
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="font-medium mb-2">Offer Sent</p>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/dashboard?tab=offers")}
                          >
                            View Offer Status
                          </Button>
                        </div>
                      ) : (
                        <MakeOfferDialog
                          businessId={listing._id}
                          askingPrice={listing.financials.askingPrice}
                          onSuccess={() => {
                            window.location.reload();
                          }}
                          trigger={
                            <Button className="w-full" size="lg">
                              Buy / Make Offer
                            </Button>
                          }
                        />
                      )}
                    </>
                  )}

                  {isInvestment && (
                    <InvestmentOfferDialog
                      business={listing}
                      trigger={
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="lg"
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          Invest Now
                        </Button>
                      }
                      onSuccess={() => {
                        navigate("/dashboard?tab=investments");
                      }}
                    />
                  )}
                </div>
              )}
              {role === "seller" &&
                user?.id ===
                  (typeof listing.sellerId === "string"
                    ? listing.sellerId
                    : listing.sellerId.supabaseId) && (
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
                  {(typeof listing.sellerId === "object" &&
                    listing.sellerId.profile?.name?.[0]) ||
                    "S"}
                </div>
                <div>
                  <p className="font-medium">
                    {(typeof listing.sellerId === "object" &&
                      listing.sellerId.profile?.name) ||
                      "Seller"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verified Seller
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleContactSeller}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Seller
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

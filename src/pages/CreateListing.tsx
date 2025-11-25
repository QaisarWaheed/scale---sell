import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createListing, getListingById, updateListing } from "@/lib/listingApi";
import api from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateListing() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);

  const isEditMode = !!id;

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    revenue: "",
    profit: "",
    askingPrice: "",
    yearEstablished: "",
    employees: "",
    website: "",
    reasonForSelling: "",
    imageUrl: "",
    listingType: "sale", // sale, investment, both
    seekingInvestment: false,
    minInvestment: "",
    maxInvestment: "",
    equityOffered: "",
    revenueShareOffered: "",
    investmentPurpose: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata.role || "investor");
      } else {
        navigate("/auth");
      }
      setAuthLoading(false);
    };
    checkUser();
  }, [navigate]);

  // Fetch listing data if in edit mode
  useEffect(() => {
    const fetchListingData = async () => {
      if (!id) return;

      try {
        setInitialLoading(true);
        const listing = await getListingById(id);

        // Populate form with existing data
        setFormData({
          title: listing.title,
          category: listing.category,
          description: listing.description,
          location: listing.location,
          revenue: listing.financials.revenue.toString(),
          profit: listing.financials.profit.toString(),
          askingPrice: listing.financials.askingPrice.toString(),
          yearEstablished: listing.details?.yearEstablished?.toString() || "",
          employees: listing.details?.employees?.toString() || "",
          website: listing.details?.website || "",
          reasonForSelling: listing.details?.reasonForSelling || "",
          imageUrl:
            listing.images && listing.images.length > 0
              ? listing.images[0]
              : "",
          listingType: listing.listingType,
          seekingInvestment:
            listing.investmentOptions?.seekingInvestment || false,
          minInvestment:
            listing.investmentOptions?.minInvestment?.toString() || "",
          maxInvestment:
            listing.investmentOptions?.maxInvestment?.toString() || "",
          equityOffered:
            listing.investmentOptions?.equityOffered?.toString() || "",
          revenueShareOffered:
            listing.investmentOptions?.revenueShareOffered?.toString() || "",
          investmentPurpose: listing.investmentOptions?.investmentPurpose || "",
        });
      } catch (error) {
        console.error("Error fetching listing details:", error);
        toast({
          title: "Error",
          description: "Failed to load listing details.",
          variant: "destructive",
        });
        navigate("/dashboard?tab=listings");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id && !authLoading) {
      fetchListingData();
    }
  }, [id, authLoading, navigate, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, seekingInvestment: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construct the payload matching the API expectation

      // Upload image if selected
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          // If upload fails, stop submission
          setLoading(false);
          return;
        }
      }

      const investmentOptions =
        formData.listingType === "investment" || formData.listingType === "both"
          ? {
              seekingInvestment: true,
              minInvestment: formData.minInvestment
                ? Number(formData.minInvestment)
                : undefined,
              maxInvestment: formData.maxInvestment
                ? Number(formData.maxInvestment)
                : undefined,
              equityOffered: formData.equityOffered
                ? Number(formData.equityOffered)
                : undefined,
              revenueShareOffered: formData.revenueShareOffered
                ? Number(formData.revenueShareOffered)
                : undefined,
              investmentPurpose: formData.investmentPurpose,
            }
          : undefined;

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        listingType: formData.listingType as "sale" | "investment" | "both",
        investmentOptions,
        financials: {
          askingPrice: Number(formData.askingPrice),
          revenue: Number(formData.revenue),
          profit: Number(formData.profit),
        },
        images: finalImageUrl ? [finalImageUrl] : [],
        yearEstablished: formData.yearEstablished
          ? Number(formData.yearEstablished)
          : undefined,
        employees: formData.employees ? Number(formData.employees) : undefined,
        website: formData.website,
        reasonForSelling: formData.reasonForSelling,
      };

      if (isEditMode && id) {
        await updateListing(id, payload);
        toast({
          title: "Success",
          description: "Listing updated successfully!",
        });
      } else {
        await createListing(payload);
        toast({
          title: "Success",
          description: "Listing created successfully!",
        });
      }

      navigate("/dashboard?tab=listings");
    } catch (error) {
      console.error("Error saving listing:", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialLoading) return <LoadingSpinner centered />;

  return (
    <DashboardLayout
      role={role}
      userEmail={user?.email}
      title={isEditMode ? "Edit Listing" : "Create Listing"}
    >
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 pl-0"
          onClick={() => navigate("/dashboard?tab=listings")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Listings
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Business Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Profitable SaaS Platform"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => handleSelectChange(val, "category")}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. New York, NY or Remote"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="listingType">Listing Type</Label>
                <Select
                  value={formData.listingType}
                  onValueChange={(val) =>
                    handleSelectChange(val, "listingType")
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale Only</SelectItem>
                    <SelectItem value="investment">
                      Seeking Investment Only
                    </SelectItem>
                    <SelectItem value="both">
                      For Sale & Seeking Investment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your business, key highlights, and growth potential..."
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Investment Options (Conditional) */}
          {(formData.listingType === "investment" ||
            formData.listingType === "both") && (
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
                <CardDescription>
                  Specify your investment requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="minInvestment">Min Investment (Rs.)</Label>
                    <Input
                      id="minInvestment"
                      name="minInvestment"
                      type="number"
                      placeholder="0.00"
                      value={formData.minInvestment}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxInvestment">Max Investment (Rs.)</Label>
                    <Input
                      id="maxInvestment"
                      name="maxInvestment"
                      type="number"
                      placeholder="0.00"
                      value={formData.maxInvestment}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="equityOffered">Equity Offered (%)</Label>
                    <Input
                      id="equityOffered"
                      name="equityOffered"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.equityOffered}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="revenueShareOffered">
                      Revenue Share Offered (%)
                    </Label>
                    <Input
                      id="revenueShareOffered"
                      name="revenueShareOffered"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.revenueShareOffered}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="investmentPurpose">Investment Purpose</Label>
                  <Textarea
                    id="investmentPurpose"
                    name="investmentPurpose"
                    placeholder="How will the funds be used?"
                    className="min-h-[80px]"
                    value={formData.investmentPurpose}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
              <CardDescription>Key financial metrics (Annual)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="revenue">Revenue (Rs.)</Label>
                  <Input
                    id="revenue"
                    name="revenue"
                    type="number"
                    placeholder="0.00"
                    value={formData.revenue}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profit">Profit / EBITDA (Rs.)</Label>
                  <Input
                    id="profit"
                    name="profit"
                    type="number"
                    placeholder="0.00"
                    value={formData.profit}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="askingPrice">Asking Price (Rs.)</Label>
                  <Input
                    id="askingPrice"
                    name="askingPrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.askingPrice}
                    onChange={handleChange}
                    required={formData.listingType !== "investment"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input
                    id="yearEstablished"
                    name="yearEstablished"
                    type="number"
                    placeholder="YYYY"
                    value={formData.yearEstablished}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    id="employees"
                    name="employees"
                    type="number"
                    placeholder="0"
                    value={formData.employees}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website URL (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Business Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {uploading && <LoadingSpinner />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image to showcase your business.
                </p>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Current Image:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Current listing"
                      className="h-32 w-auto object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard?tab=listings")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? "Update Listing" : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { createListing } from "@/lib/listingApi";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

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
    imageUrl: "", // Simple URL input for MVP
  });

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload matching the API expectation
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        revenue: Number(formData.revenue),
        profit: Number(formData.profit),
        askingPrice: Number(formData.askingPrice),
        images: formData.imageUrl ? [formData.imageUrl] : [],
        details: {
          // Add details object if your API supports it, otherwise flatten or adjust
          yearEstablished: Number(formData.yearEstablished),
          employees: Number(formData.employees),
          website: formData.website,
          reasonForSelling: formData.reasonForSelling,
        },
      };

      await createListing(payload);

      toast({
        title: "Success",
        description: "Listing created successfully!",
      });
      navigate("/dashboard?tab=listings");
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create listing.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner centered />;

  return (
    <DashboardLayout role={role} userEmail={user?.email} title="Create Listing">
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

          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
              <CardDescription>Key financial metrics (Annual)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="revenue">Revenue ($)</Label>
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
                  <Label htmlFor="profit">Profit / EBITDA ($)</Label>
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
                  <Label htmlFor="askingPrice">Asking Price ($)</Label>
                  <Input
                    id="askingPrice"
                    name="askingPrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.askingPrice}
                    onChange={handleChange}
                    required
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
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Provide a direct link to an image to showcase your business.
                </p>
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Create Listing
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

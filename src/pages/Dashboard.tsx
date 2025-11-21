import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Building2, TrendingUp, DollarSign, FileText, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const userRole = user?.user_metadata?.role || "investor";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {userRole === "seller" ? "Seller Dashboard" : "Investor Dashboard"}
              </h1>
              <p className="text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Listings</CardDescription>
                <CardTitle className="text-3xl">
                  {userRole === "seller" ? "3" : "12"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Value</CardDescription>
                <CardTitle className="text-3xl">$2.4M</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>
                  {userRole === "seller" ? "Offers Received" : "Saved Listings"}
                </CardDescription>
                <CardTitle className="text-3xl">
                  {userRole === "seller" ? "8" : "5"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Messages</CardDescription>
                <CardTitle className="text-3xl">14</CardTitle>
              </CardHeader>
              <CardContent>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {userRole === "seller" ? "Your Listings" : "Recommended Businesses"}
                </CardTitle>
                <CardDescription>
                  {userRole === "seller" 
                    ? "Manage your business listings" 
                    : "Businesses that match your interests"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="w-16 h-16 rounded bg-gradient-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">Sample Business {i}</h3>
                        <p className="text-sm text-muted-foreground">E-Commerce • $500K</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {userRole === "seller" ? (
                    <>
                      <Button variant="premium" className="w-full">
                        <Building2 className="h-4 w-4 mr-2" />
                        Create New Listing
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Documents
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="premium" className="w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Browse Listings
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        My Offers
                      </Button>
                    </>
                  )}
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium">New message received</p>
                        <p className="text-muted-foreground text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary mt-2" />
                      <div>
                        <p className="font-medium">Offer submitted</p>
                        <p className="text-muted-foreground text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                      <div>
                        <p className="font-medium">Document verified</p>
                        <p className="text-muted-foreground text-xs">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

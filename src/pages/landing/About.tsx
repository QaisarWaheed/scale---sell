import { PageLayout } from "@/components/layouts/PageLayout";
import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Shield, Users, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <PageLayout variant="muted">
      <PageContainer className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Scale & Sell</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting entrepreneurs and investors to scale successful
            businesses
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg mb-4">
                Scale & Sell is a modern marketplace designed to facilitate the
                buying and selling of established businesses. We bring together
                entrepreneurs ready to pass the torch and investors seeking
                proven opportunities.
              </p>
              <p className="text-lg mb-4">
                Our platform provides the tools, security, and transparency
                needed for successful business transactions. From listing to
                closing, we ensure every step is safe, clear, and professional.
              </p>
              <p className="text-lg">
                With built-in escrow, secure messaging, and digital contracts,
                we make it easier than ever to find, evaluate, and acquire your
                next business opportunity.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                Simplify business acquisitions for everyone
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Security First</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security and escrow
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Trusted network of sellers and investors
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Growth</h3>
              <p className="text-sm text-muted-foreground">
                Helping businesses reach their potential
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-1">Verified Listings</h3>
              <p className="text-muted-foreground">
                Every business listing is reviewed and verified before going
                live
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-1">Secure Escrow</h3>
              <p className="text-muted-foreground">
                Funds are protected until all conditions are met
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-1">Expert Support</h3>
              <p className="text-muted-foreground">
                Our team is here to help you through every step
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}

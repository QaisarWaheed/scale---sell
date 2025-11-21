import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, TrendingUp, Users, CheckCircle, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-handshake.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Buy & Sell Established Businesses with Confidence
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                The trusted marketplace connecting entrepreneurs with vetted, revenue-generating businesses. 
                Secure transactions, transparent processes, and expert support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button variant="premium" size="xl" asChild>
                  <Link to="/browse">Browse Businesses</Link>
                </Button>
                <Button variant="hero" size="xl" asChild>
                  <Link to="/auth?mode=signup">Sell Your Business</Link>
                </Button>
              </div>
              <div className="flex gap-8 justify-center md:justify-start pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-foreground">500+</p>
                  <p className="text-sm text-primary-foreground/80">Active Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-foreground">$2.5B+</p>
                  <p className="text-sm text-primary-foreground/80">Transaction Volume</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-foreground">10K+</p>
                  <p className="text-sm text-primary-foreground/80">Happy Clients</p>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img 
                src={heroImage} 
                alt="Business professionals" 
                className="rounded-2xl shadow-premium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Scale & Sell?</h2>
            <p className="text-lg text-muted-foreground">
              We provide everything you need for a secure, seamless business transaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Verified Listings</CardTitle>
                <CardDescription>
                  Every business is thoroughly vetted and verified before listing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Secure Escrow</CardTitle>
                <CardDescription>
                  Protected payments with built-in escrow services for peace of mind
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Data-Driven Insights</CardTitle>
                <CardDescription>
                  Comprehensive analytics and financial data for informed decisions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expert Support</CardTitle>
                <CardDescription>
                  Dedicated support team to guide you through every step
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Wide Selection</CardTitle>
                <CardDescription>
                  Diverse range of businesses across industries and price points
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Simple Process</CardTitle>
                <CardDescription>
                  Streamlined workflow from discovery to deal closure
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple, transparent process from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Browse & Discover", desc: "Explore verified businesses matching your criteria" },
              { step: "2", title: "Connect & Verify", desc: "Access detailed financials and connect with sellers" },
              { step: "3", title: "Negotiate & Agree", desc: "Work out terms with built-in messaging and contracts" },
              { step: "4", title: "Close with Escrow", desc: "Complete the transaction securely through our escrow service" },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="font-semibold text-xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who've successfully bought or sold businesses through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="premium" size="xl" asChild>
              <Link to="/auth?mode=signup">Create Free Account</Link>
            </Button>
            <Button variant="hero" size="xl" asChild>
              <Link to="/browse">View Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

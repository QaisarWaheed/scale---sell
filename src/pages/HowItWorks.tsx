import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Shield, Zap } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple, secure platform connecting business sellers with
              investors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Create Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sign up as a seller or investor. Set up your profile and
                  choose your role.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. List or Browse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sellers list businesses. Investors browse opportunities and
                  connect with sellers.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Secure Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use our escrow system and contract tools to ensure safe,
                  transparent deals.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">The Process</h2>
            <div className="space-y-6">
              {[
                {
                  step: "Discovery",
                  desc: "Browse verified business listings with detailed financials",
                },
                {
                  step: "Communication",
                  desc: "Connect with sellers through our secure messaging system",
                },
                {
                  step: "Due Diligence",
                  desc: "Review documents and ask questions before committing",
                },
                {
                  step: "Escrow",
                  desc: "Funds are held securely until all conditions are met",
                },
                {
                  step: "Contract",
                  desc: "Digital contracts ensure all parties are protected",
                },
                {
                  step: "Completion",
                  desc: "Transfer ownership and access all necessary documents",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{item.step}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

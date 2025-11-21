import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageContainer } from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout>
      <PageContainer className="py-20">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Oops! The page you're looking for doesn't exist. It might have
              been moved or deleted.
            </p>
          </div>

          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
            >
              <a>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </a>
            </Button>
          </div>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please{" "}
              <Link to="/contact" className="text-primary hover:underline">
                contact our support team
              </Link>
              .
            </p>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
};

export default NotFound;

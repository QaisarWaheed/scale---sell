import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { investmentApi } from "@/lib/investmentApi";
import { BusinessListing } from "@/types";
import { Loader2 } from "lucide-react";

const investmentSchema = z.object({
  investmentAmount: z.coerce.number().min(1, "Amount must be greater than 0"),
  investmentType: z.enum(["equity", "revenue_share"]),
  equityPercentage: z.coerce.number().min(0).max(100).optional(),
  revenueSharePercentage: z.coerce.number().min(0).max(100).optional(),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 month")
    .optional(),
  conditions: z.string().min(10, "Please specify conditions"),
  exitStrategy: z.string().optional(),
  message: z.string().optional(),
});

interface InvestmentOfferDialogProps {
  business: BusinessListing;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function InvestmentOfferDialog({
  business,
  trigger,
  onSuccess,
}: InvestmentOfferDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      investmentAmount: business.investmentOptions?.minInvestment || 0,
      investmentType: "equity",
      conditions: "",
      message: "",
    },
  });

  const investmentType = form.watch("investmentType");

  const onSubmit = async (values: z.infer<typeof investmentSchema>) => {
    try {
      setLoading(true);

      // Validate against business constraints
      if (
        business.investmentOptions?.minInvestment &&
        values.investmentAmount < business.investmentOptions.minInvestment
      ) {
        toast.error(
          `Minimum investment is ${business.investmentOptions.minInvestment}`
        );
        return;
      }

      if (
        business.investmentOptions?.maxInvestment &&
        values.investmentAmount > business.investmentOptions.maxInvestment
      ) {
        toast.error(
          `Maximum investment is ${business.investmentOptions.maxInvestment}`
        );
        return;
      }

      await investmentApi.create({
        businessId: business._id,
        investmentAmount: values.investmentAmount,
        investmentType: values.investmentType,
        equityPercentage: values.equityPercentage,
        revenueSharePercentage: values.revenueSharePercentage,
        terms: {
          duration: values.duration,
          conditions: values.conditions,
          exitStrategy: values.exitStrategy,
        },
        message: values.message,
      });

      toast.success("Investment offer sent successfully!");
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="lg">Invest Now</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make an Investment Offer</DialogTitle>
          <DialogDescription>
            Propose your investment terms for {business.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="investmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Amount (PKR)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      {business.investmentOptions?.minInvestment &&
                        `Min: ${business.investmentOptions.minInvestment.toLocaleString()} `}
                      {business.investmentOptions?.maxInvestment &&
                        `Max: ${business.investmentOptions.maxInvestment.toLocaleString()}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="revenue_share">
                          Revenue Share
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investmentType === "equity" ? (
                <FormField
                  control={form.control}
                  name="equityPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equity Requested (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="revenueSharePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Share Requested (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Months)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty for indefinite
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions & Terms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify any conditions or terms for this investment..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exitStrategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposed Exit Strategy (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How do you plan to exit this investment?"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Seller (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Introduce yourself and explain why you're interested..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Offer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

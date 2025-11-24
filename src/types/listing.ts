export interface BusinessListing {
  _id: string;
  sellerId: {
    _id: string;
    email: string;
    profile?: {
      name?: string;
    };
  };
  title: string;
  description: string;
  category: string;
  location: string;
  financials: {
    askingPrice: number;
    revenue: number;
    profit: number;
    expenses?: number;
  };
  assets?: string[];
  liabilities?: string[];
  growthOpportunities?: string[];
  challenges?: string[];
  employees?: number;
  yearEstablished?: number;
  images?: string[];
  documents?: string[];
  status: "pending" | "approved" | "rejected" | "active" | "sold";
  createdAt: string;
  updatedAt: string;
}

export interface ListingQueryParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  location: string;
  financials: {
    askingPrice: number;
    revenue: number;
    profit: number;
    expenses?: number;
  };
  assets?: string[];
  liabilities?: string[];
  growthOpportunities?: string[];
  challenges?: string[];
  employees?: number;
  yearEstablished?: number;
  website?: string;
  reasonForSelling?: string;
  images?: string[];
  documents?: string[];
}

export interface UpdateListingData extends Partial<CreateListingData> {
  status?: "pending" | "approved" | "rejected" | "active" | "sold";
}

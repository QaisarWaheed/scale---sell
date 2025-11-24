import axios, { AxiosInstance } from "axios";

// Escrow.com API Types
export interface EscrowCustomer {
  email: string;
  name?: string;
  phone?: string;
}

export interface EscrowItem {
  title: string;
  description: string;
  type: string; // "general_merchandise", "domain_name", "vehicle", etc.
  inspection_period: number; // in days
  quantity: number;
  schedule?: {
    amount: number;
    payer_customer: string;
    beneficiary_customer: string;
  }[];
}

export interface CreateEscrowTransactionParams {
  buyer: EscrowCustomer;
  seller: EscrowCustomer;
  items: EscrowItem[];
  currency: string;
  description?: string;
}

export interface EscrowTransactionResponse {
  id: string;
  parties: {
    buyer: EscrowCustomer;
    seller: EscrowCustomer;
  };
  items: EscrowItem[];
  status: string;
  currency: string;
  created_at: string;
  updated_at: string;
  payment_url?: string;
}

export interface WebhookPayload {
  event: string;
  transaction_id: string;
  status: string;
  timestamp: string;
  data: any;
}

class EscrowService {
  private client: AxiosInstance;
  private apiKey: string;
  private apiEmail: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.ESCROW_API_KEY || "";
    this.apiEmail = process.env.ESCROW_API_EMAIL || "";

    // Use sandbox for testing, production URL when ready
    this.baseURL =
      process.env.ESCROW_API_ENV === "production"
        ? "https://api.escrow.com"
        : "https://api.escrow-sandbox.com";

    if (!this.apiKey) {
      console.warn(
        "ESCROW_API_KEY not found in environment variables. Escrow service will not function properly."
      );
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: this.apiEmail,
        password: this.apiKey,
      },
    });
  }

  /**
   * Create a new escrow transaction
   */
  async createTransaction(
    params: CreateEscrowTransactionParams
  ): Promise<EscrowTransactionResponse> {
    try {
      const response = await this.client.post("/2017-09-01/transaction", {
        parties: {
          buyer: params.buyer,
          seller: params.seller,
        },
        items: params.items,
        currency: params.currency,
        description: params.description,
      });

      // Generate payment URL (Escrow.com provides this in their response or we construct it)
      const paymentUrl = `${this.baseURL.replace("api.", "")}/transaction/${
        response.data.id
      }`;

      return {
        ...response.data,
        payment_url: paymentUrl,
      };
    } catch (error: any) {
      console.error(
        "Error creating Escrow.com transaction:",
        error.response?.data || error.message
      );
      throw new Error(
        `Failed to create Escrow.com transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get transaction details from Escrow.com
   */
  async getTransaction(
    transactionId: string
  ): Promise<EscrowTransactionResponse> {
    try {
      const response = await this.client.get(
        `/2017-09-01/transaction/${transactionId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching Escrow.com transaction:",
        error.response?.data || error.message
      );
      throw new Error(
        `Failed to fetch Escrow.com transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Verify webhook signature (if Escrow.com provides webhook signatures)
   * This is a placeholder - implement based on Escrow.com's webhook documentation
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implement proper webhook signature verification
    // For now, return true to allow webhooks through
    // In production, you should verify the webhook using HMAC or similar
    console.log(
      "Webhook signature verification - implement based on Escrow.com docs"
    );
    return true;
  }

  /**
   * Map Escrow.com status to our internal status
   */
  mapEscrowStatus(escrowStatus: string): string {
    const statusMap: { [key: string]: string } = {
      pending: "pending",
      "funds received": "holding",
      "funds held": "holding",
      "funds released": "released",
      completed: "released",
      cancelled: "cancelled",
      disputed: "holding",
    };

    return statusMap[escrowStatus.toLowerCase()] || "pending";
  }

  /**
   * Check if the service is configured properly
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.apiEmail;
  }
}

export default new EscrowService();

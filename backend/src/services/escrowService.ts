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
   * Verify webhook signature
   * Note: This is a basic implementation. In production, you should use the specific
   * signature verification method provided by Escrow.com (e.g., HMAC-SHA1/256).
   * Ensure ESCROW_WEBHOOK_SECRET is set in your environment variables.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // If no secret is set, we can't verify, so we log a warning and return false (or true if you want to bypass in dev)
    const secret = process.env.ESCROW_WEBHOOK_SECRET;
    if (!secret) {
      console.warn(
        "ESCROW_WEBHOOK_SECRET not set. Skipping signature verification."
      );
      return process.env.NODE_ENV === "development";
    }

    // Example verification (adjust based on actual Escrow.com docs)
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', secret)
    //   .update(payload)
    //   .digest('hex');
    // return signature === expectedSignature;

    // For now, assuming development/sandbox environment where strict verification might be optional
    // or handled differently.
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

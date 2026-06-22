import { getEnv } from "@/core/env";
import { buildAuthHeaders, type ServiceScope } from "./trust";

/**
 * Typed client for the backend-only AI service. The frontend NEVER calls this;
 * only the main app's server does, attaching service-trust headers + the org's
 * AI client_id. Endpoints mirror ai-service-api-contract.md (KEEP set).
 */
export class AiServiceError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

async function call<T>(
  clientId: string,
  scope: ServiceScope,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const env = getEnv();
  const url = `${env.AI_SERVICE_URL.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(clientId, scope),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as unknown) : undefined;
  if (!res.ok) {
    const message =
      (parsed as { detail?: { message?: string } })?.detail?.message ??
      `AI service error ${res.status}`;
    throw new AiServiceError(res.status, message, parsed);
  }
  return parsed as T;
}

export type ChatResponse = {
  question: string;
  answer: string;
  similarity: number;
  status: string;
  id?: string;
  client_id?: number;
  usage?: Record<string, unknown>;
  credit_remaining?: number | null;
  intent_hint?: string | null;
  language?: string | null;
};

export type CreditStatus = {
  client_id: number;
  credit: number;
  min_threshold: number;
  balance_low: boolean;
  monthly_budget: number;
  month_usage: number;
  usage_pct: number;
  alert_level: "none" | "warning" | "high" | "critical";
  subscription_status: "none" | "active" | "ending_soon" | "expired";
};

export const aiService = {
  /** Chat turn. clientId = org's AI client_acc id. */
  chat(clientId: string, question: string, conversationId?: string) {
    return call<ChatResponse>(clientId, "write", "POST", "/main/chat", {
      question,
      id: conversationId,
    });
  },

  /** Read credit + budget + subscription status (drives low-credit notifications). */
  creditStatus(clientId: string) {
    return call<CreditStatus>(clientId, "read", "GET", "/credit/status");
  },

  /** Semantic search over the org's knowledge collection. */
  knowledgeQuery(clientId: string, queryText: string, topK = 10) {
    return call<{ results: unknown[]; count: number }>(
      clientId,
      "read",
      "POST",
      "/vectordb-auth/query",
      {
        query_text: queryText,
        top_k: topK,
      }
    );
  },

  /**
   * Provision/init an AI tenant for an org we own (gap G2). Until the AI service
   * ships a single provision endpoint, this maps to /admin/create + topup.
   * Stubbed — implement once the contract is finalized.
   */
  async provisionTenant(_input: {
    name: string;
    initialCredit?: number;
  }): Promise<{ aiClientId: string }> {
    throw new AiServiceError(
      501,
      "provisionTenant not implemented — see ai-service-api-contract.md G2"
    );
  },
};

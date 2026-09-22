import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();
  if (!apiKey || !model) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      project: "QSUI research prototype",
      network: "No public-network deployment is asserted by this health endpoint",
      tokenModelCap: "1,000,000,000,000,000 QSUI (design model)",
      applicationPqcStatus: "ML-DSA/ML-KEM integration tests exist; Move contracts do not enforce PQC",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasGeminiModel: Boolean(process.env.GEMINI_MODEL),
    });
  });

  // AI Agentic Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, persona = "sentinel", history = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const client = getGeminiClient();

      // System instructions per agent persona
      const systemInstructions: Record<string, string> = {
        sentinel: `You are the QSUI research assistant. Treat QSUI as a research/testnet-oriented prototype. The checked-in Sui Move modules do not implement ML-DSA or ML-KEM verification. Do not claim mainnet deployment, independent audit, whole-system quantum safety, real liquidity, exchange listings, validator counts, partnerships, or performance unless the user supplies reproducible external evidence. Clearly distinguish application-layer PQC tests from on-chain enforcement.`,
        legal: `You are a regulatory-research assistant for the QSUI prototype. Provide educational issue-spotting only, not legal advice or a legal classification. Do not claim that QSUI is registered, MiCA-compliant, a non-security, exempt, approved, or formally verified. Explain that token classification depends on facts, jurisdiction, distribution, governance, marketing, and professional legal review.`,
        automaton: `You are a cellular-automata research assistant. Explain Conway B3/S23 and the repository's experiments accurately. Do not describe the automaton as quantum entropy, consensus, a cryptographic beacon, or production validator infrastructure unless concrete implementation evidence supports that statement.`,
        marketing: `You are a marketing-draft assistant for QSUI. Keep all copy evidence-first. Treat tokenomics, exchange/liquidity plans, airdrops, partnerships, roadshows, and adoption as proposals unless independently evidenced. Never guarantee returns, listings, liquidity, compliance, security, or production readiness.`,
      };

      const selectedInstruction = systemInstructions[persona] || systemInstructions.sentinel;

      if (!client) {
        // Fallback simulated intelligent response if GEMINI_API_KEY is not yet attached
        const fallbackReplies: Record<string, string> = {
          sentinel: `### QSUI Research Assistant\n\nNo live AI provider is configured. QSUI is a research/testnet-oriented prototype. The repository contains application-layer ML-DSA/ML-KEM tests, while the checked-in Move contracts do not enforce PQC. Your query was: "${message}"`,
          legal: `### QSUI Regulatory Research\n\nNo live AI provider is configured. This local fallback cannot determine securities, MiCA, tax, AML, or other legal status. QSUI's tokenomics and governance materials are design proposals and require jurisdiction-specific professional review. Your query was: "${message}"`,
          automaton: `### QSUI Conway Research\n\nNo live AI provider is configured. The repository includes Conway cellular-automaton experiments. They should not be described as quantum entropy, public-network consensus, or cryptographic validation without separate evidence. Your query was: "${message}"`,
          marketing: `### QSUI Marketing Draft Boundary\n\nNo live AI provider is configured. Market copy must treat exchange listings, liquidity, partnerships, token value, adoption, and institutional use as unverified unless independently evidenced. Your query was: "${message}"`,
        };

        return res.json({
          response: fallbackReplies[persona] || fallbackReplies.sentinel,
          persona,
          timestamp: new Date().toISOString(),
          isSimulated: true,
        });
      }

      // Live Gemini 3.7 Flash generation
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL!,
        contents: [
          ...history.map((h: { role: string; content: string }) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        config: {
          systemInstruction: selectedInstruction,
          temperature: 0.7,
          topP: 0.95,
        },
      });

      const responseText = response.text || "No response generated.";

      return res.json({
        response: responseText,
        persona,
        timestamp: new Date().toISOString(),
        isSimulated: false,
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({
        error: "Failed to generate AI response",
        details: error?.message || "Unknown error",
      });
    }
  });

  // Sui TestNet Real-Time Query Endpoint
  app.get("/api/sui/testnet-status", async (req, res) => {
    try {
      const response = await fetch("https://fullnode.testnet.sui.io:443", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getLatestCheckpointSequenceNumber",
          params: [],
        }),
      });
      if (!response.ok) {
        throw new Error(`Sui RPC returned HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data?.error || data?.result === undefined) {
        throw new Error(data?.error?.message || "Sui RPC response missing checkpoint result");
      }
      res.json({
        online: true,
        network: "Sui Testnet RPC",
        rpcEndpoint: "https://fullnode.testnet.sui.io:443",
        checkpoint: String(data.result),
        packageId: process.env.QSUI_PACKAGE_ID || null,
        treasuryCap: process.env.QSUI_TREASURY_CAP || null,
        deploymentVerifiedByThisEndpoint: false,
        applicationPqcStatus: "The web app has ML-DSA/ML-KEM integration tests; checked-in Move modules do not verify PQC signatures.",
      });
    } catch (e: any) {
      res.status(503).json({
        online: false,
        network: "Sui Testnet RPC",
        rpcEndpoint: "https://fullnode.testnet.sui.io:443",
        checkpoint: null,
        packageId: process.env.QSUI_PACKAGE_ID || null,
        treasuryCap: process.env.QSUI_TREASURY_CAP || null,
        deploymentVerifiedByThisEndpoint: false,
        error: e?.message || "Sui Testnet RPC unavailable",
      });
    }
  });

  // Automated Legal / Audit / Tokenomics Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { type = "howey_test", details = "" } = req.body;
      const client = getGeminiClient();

      const prompts: Record<string, string> = {
        howey_test: `Provide an educational Howey-test issue-spotting analysis for the QSUI design. Do not provide a definitive legal classification or claim registration, exemption, approval, or compliance. Identify missing facts and recommend qualified legal review.`,
        tokenomics_audit: `Analyze the QSUI tokenomics design as a hypothetical model. Do not assume real liquidity, APY, burns, exchange listings, market value, users, or deployed supply. Identify economic risks, assumptions, and evidence needed.`,
        quantum_threat_audit: `Analyze the repository's application-layer ML-DSA/ML-KEM experiments and their limitations. Do not claim whole-system quantum safety, specific quantum break timelines, or on-chain PQC enforcement without evidence.`,
        automaton_simulation: `Analyze the mathematical properties of the repository's Conway Game of Life experiments. Keep them separate from quantum entropy, cryptographic randomness, and consensus claims unless those mechanisms are actually implemented and evidenced.`,
      };

      const promptToRun = prompts[type] || prompts.howey_test;

      if (!client) {
        return res.json({
          report: `### QSUI Local Research Note: ${type.toUpperCase()}\n\nNo live AI provider is configured. This endpoint is returning a disclosure-only fallback, not a legal opinion, security audit, market analysis, or cryptographic certification.\n\nRequested scope: ${promptToRun}`,
          type,
          isSimulated: true,
          disclaimer: "Research aid only; no legal, financial, security, deployment, or compliance conclusion is asserted.",
        });
      }

      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL!,
        contents: `${promptToRun}\n\nAdditional user parameters: ${details}`,
        config: {
          systemInstruction: "You are a research assistant for QSUI. Provide evidence-based analysis, clearly identify unknowns, and do not issue legal conclusions, compliance certifications, security certifications, investment recommendations, or claims of deployment/adoption without reproducible evidence.",
        },
      });

      return res.json({
        report: response.text || "Report generation incomplete.",
        type,
        isSimulated: false,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      return res.status(500).json({ error: "Failed to run analysis", details: error?.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QSUI research prototype server listening on port ${PORT}; public deployment, legal status, market adoption, and on-chain PQC are not asserted`);
  });
}

startServer();

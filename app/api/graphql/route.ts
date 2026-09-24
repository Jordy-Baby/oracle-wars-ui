import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_TIMEOUT_MS = 15_000;

export async function POST(request: NextRequest) {
  const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT;

  if (!graphqlEndpoint) {
    return NextResponse.json(
      { error: "GraphQL endpoint not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(
        `GraphQL upstream returned non-JSON (HTTP ${response.status}): ${text.slice(0, 200)}`
      );
      return NextResponse.json(
        { error: `GraphQL upstream returned HTTP ${response.status}` },
        { status: 502 }
      );
    }

    // Client errors (bad query etc.) pass through; upstream failures become 502
    const status = response.ok ? 200 : response.status < 500 ? response.status : 502;
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Error proxying GraphQL request:", error);
    return NextResponse.json(
      { error: "Failed to proxy GraphQL request" },
      { status: 502 }
    );
  }
}

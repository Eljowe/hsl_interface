const API_KEY = process.env.API_KEY;
const API_URL = "https://api.digitransit.fi/geocoding/v1/search";

export async function POST(request: Request) {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API_KEY is not set" }), {
      status: 500,
    });
  }

  const { searchWord } = await request.json();

  const queryParams = new URLSearchParams({
    "digitransit-subscription-key": API_KEY,
    text: searchWord,
    lang: "fi",
    sources: "gtfsHSL,gtfsHSLlautta",
    layers: "stop,station",
  });

  try {
    const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), {
      status: 500,
    });
  }
}

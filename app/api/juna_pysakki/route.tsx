const API_URL = "https://api.digitransit.fi/routing/v2/hsl/gtfs/v1";
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API_KEY is not set" }), {
      status: 500,
    });
  }

  const { terminalId } = await request.json();
  const payload = {
    id: "stopRoutes_TerminalPageMapContainer_Query",
    query: `
      query stopRoutes_TerminalPageMapContainer_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalPageMapContainer_station
          id
        }
      }

      fragment TerminalPageMapContainer_station on Stop {
        lat
        lon
        platformCode
        name
        code
        desc
        vehicleMode
        locationType
      }
    `,
    variables: {
      terminalId,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "digitransit-subscription-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}

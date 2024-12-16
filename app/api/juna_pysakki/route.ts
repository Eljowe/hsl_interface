const API_URL =
  "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API_KEY is not set" }), {
      status: 500,
    });
  }
  const { stopId } = await request.json();

  const payload = {
    id: "stopRoutes_TerminalPageHeaderContainer_Query",
    query: `
      query stopRoutes_TerminalPageHeaderContainer_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalPageHeaderContainer_station
          id
        }
      }

      fragment StopCardHeaderContainer_stop on Stop {
        gtfsId
        name
        code
        desc
        zoneId
        alerts {
          alertSeverityLevel
          effectiveEndDate
          effectiveStartDate
          id
        }
        lat
        lon
        stops {
          name
          desc
          id
        }
      }

      fragment TerminalPageHeaderContainer_station on Stop {
        ...StopCardHeaderContainer_stop
      }
    `,
    variables: {
      terminalId: stopId,
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

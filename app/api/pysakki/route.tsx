const API_URL = "https://api.digitransit.fi/routing/v2/hsl/gtfs/v1";
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API_KEY is not set" }), {
      status: 500,
    });
  }

  const { stopId } = await request.json();

  const payload = {
    id: "stopRoutes_StopPageHeaderContainer_Query",
    query: `
      query stopRoutes_StopPageHeaderContainer_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageHeaderContainer_stop
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
        vehicleMode
      }

      fragment StopPageHeaderContainer_stop on Stop {
        ...StopCardHeaderContainer_stop
      }
    `,
    variables: {
      stopId,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "digitransit-subscription-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify({ error: data.errors }), {
      status: response.status,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

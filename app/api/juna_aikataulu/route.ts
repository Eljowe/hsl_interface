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
    query: `
      query Station($stopId: String!) {
        station(id: $stopId) {
          ...StopPageContentContainer_station
        }
      }

      fragment StopPageContentContainer_station on Stop {
        url
        stoptimes: stoptimesWithoutPatterns(startTime: 0, timeRange: 864000, numberOfDepartures: 100, omitCanceled: false) {
          ...DepartureListContainer_stoptimes
        }
      }

      fragment DepartureListContainer_stoptimes on Stoptime {
        realtimeState
        realtimeDeparture
        scheduledDeparture
        realtimeArrival
        scheduledArrival
        realtime
        serviceDay
        pickupType
        dropoffType
        headsign
        stop {
          id
          code
          platformCode
        }
        trip {
          gtfsId
          directionId
          tripHeadsign
          stops {
            id
          }
          pattern {
            route {
              gtfsId
              shortName
              longName
              mode
              type
              color
              agency {
                name
                id
              }
              alerts {
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
                id
              }
              id
            }
            code
            stops {
              gtfsId
              code
              id
            }
            id
          }
        }
      }
    `,
    variables: {
      stopId: stopId,
    },
  };

  try {
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
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    const stationData = data?.data?.station;
    if (stationData?.stoptimes) {
      stationData.stoptimes = stationData.stoptimes.slice(0, 15);
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "unknown error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}

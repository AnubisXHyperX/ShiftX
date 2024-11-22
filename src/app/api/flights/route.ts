import { validateRequest } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Define the API URL and Access Key
        const accessKey = 'ed73d0c32b8660b9d2a6f322f54e267d'; // Store your access key in environment variables
        if (!accessKey) {
            return new Response(JSON.stringify({ error: 'Missing API access key' }), { status: 500 });
        }

        // Define flight prefixes and query date range
        const prefixes = ['x7', 'x6', '5c'];
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0]; // Start of the week
        const weekEnd = new Date(today.setDate(today.getDate() + 6)).toISOString().split('T')[0]; // End of the week

        // Build the API URL
        const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${accessKey}`;

        // Fetch flight data from Aviationstack API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: 'Failed to fetch flights from Aviationstack API' }),
                { status: response.status }
            );
        }

        const data = await response.json();

        // Filter flights with prefixes x7, x6, and 5c
        const filteredFlights = data.data.filter((flight: any) =>
            prefixes.some((prefix) => flight.departure.iata.toLowerCase().startsWith(prefix))
        );

        console.log(filteredFlights)

        // Structure flights data as a schedule
        const structuredFlights = filteredFlights.reduce((acc: Record<string, any>, flight: any) => {
            const day = flight.flight_date; // Use flight_date directly
            if (!acc[day]) acc[day] = [];
            acc[day].push({
                id: flight.flight.iata, // Flight IATA code
                callsign: flight.flight.icao, // ICAO callsign
                airline: flight.airline.name, // Airline name
                aircraft: flight.aircraft?.model || 'Unknown', // Aircraft model or "Unknown"
                departure: {
                    airport: flight.departure.airport,
                    scheduled: flight.departure.scheduled,
                    estimated: flight.departure.estimated,
                },
                arrival: {
                    airport: flight.arrival.airport,
                    scheduled: flight.arrival.scheduled,
                    estimated: flight.arrival.estimated,
                },
                status: flight.flight_status, // Flight status
            });
            return acc;
        }, {});

        return new Response(JSON.stringify(structuredFlights), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
}
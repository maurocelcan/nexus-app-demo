import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const radius = searchParams.get("radius");
  const type = searchParams.get("type");

  if (!location || !radius || !type) {
    return NextResponse.json({ error: "Missing required params: location, radius, type" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Places API key not configured" }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${apiKey}&location=${location}&radius=${radius}&type=${type}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from Places API" }, { status: 502 });
  }
}

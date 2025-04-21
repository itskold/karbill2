import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes("autoscout24")) {
      return NextResponse.json(
        { error: "URL invalide. Veuillez fournir une URL AutoScout24 valide." },
        { status: 400 }
      );
    }

    // Récupérer le contenu HTML de la page
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fr,fr-FR;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Chercher le script avec l'ID "__NEXT_DATA__" qui contient les données détaillées
    const nextDataScript = $("#__NEXT_DATA__");

    if (!nextDataScript.length) {
      return NextResponse.json(
        { error: "Impossible de trouver les données du profil AutoScout24." },
        { status: 500 }
      );
    }

    // Extraire et parser le contenu JSON du script
    let nextData;
    try {
      nextData = JSON.parse(nextDataScript.html() || "{}");
    } catch (error) {
      console.error("Erreur lors du parsing du script __NEXT_DATA__:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'extraction des données du profil." },
        { status: 500 }
      );
    }

    // Extraire les informations des véhicules depuis nextData
    const listings = nextData?.props?.pageProps?.listings || [];

    if (!listings.length) {
      return NextResponse.json(
        { error: "Aucun véhicule trouvé sur ce profil." },
        { status: 404 }
      );
    }

    // Transformer les données pour avoir un format uniforme
    const vehicles = listings.map((listing: any) => {
      // Construire l'URL complète du véhicule
      const vehicleUrl = `https://www.autoscout24.be/fr/offres/${listing.id}`;
      return {
        id: listing.id || `temp-${Math.random().toString(36).substring(2, 10)}`,
        title: `${listing.vehicle.make} ${listing.vehicle.model}`,
        subtitle: `${listing.vehicle.modelVersionInput || ""}`,
        price: listing.prices.public.price || "Prix sur demande",
        imageUrl: listing.images?.[0].replace("/250x188.webp", "") || null,
        url: vehicleUrl,
      };
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Erreur lors du scraping du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'extraction des données du profil." },
      { status: 500 }
    );
  }
}

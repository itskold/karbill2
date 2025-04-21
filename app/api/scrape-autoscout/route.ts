// Scrape Autoscout
// Scrape les données d'un véhicule depuis une URL AutoScout24
// et retourne les données dans un format JSON

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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
      // Si on ne trouve pas le script __NEXT_DATA__, on retourne une erreur
      return NextResponse.json(
        { error: "Impossible de trouver les données détaillées du véhicule." },
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
        { error: "Erreur lors de l'extraction des données du véhicule." },
        { status: 500 }
      );
    }

    // Extraire les informations du véhicule depuis nextData
    const listingDetails = nextData?.props?.pageProps?.listingDetails;

    if (!listingDetails) {
      return NextResponse.json(
        { error: "Structure de données non reconnue." },
        { status: 500 }
      );
    }

    // Extraire les options des équipements
    const options: string[] = [];
    // Ajouter les options de confort
    if (listingDetails.vehicle?.equipment?.comfortAndConvenience) {
      listingDetails.vehicle.equipment.comfortAndConvenience.forEach(
        (item: any) => {
          options.push(item.id);
        }
      );
    }
    // Ajouter les options de divertissement/média
    if (listingDetails.vehicle?.equipment?.entertainmentAndMedia) {
      listingDetails.vehicle.equipment.entertainmentAndMedia.forEach(
        (item: any) => {
          options.push(item.id);
        }
      );
    }
    // Ajouter les options de sécurité
    if (listingDetails.vehicle?.equipment?.safetyAndSecurity) {
      listingDetails.vehicle.equipment.safetyAndSecurity.forEach(
        (item: any) => {
          options.push(item.id);
        }
      );
    }
    // Ajouter les options supplémentaires
    if (listingDetails.vehicle?.equipment?.extras) {
      listingDetails.vehicle.equipment.extras.forEach((item: any) => {
        options.push(item.id);
      });
    }

    // Formater la date de première circulation au format YYYY-MM-DD pour l'input date
    let firstCirculationDate = null;
    if (listingDetails.vehicle?.firstRegistrationDateRaw) {
      const date = new Date(listingDetails.vehicle.firstRegistrationDateRaw);
      firstCirculationDate = date.toISOString().split("T")[0]; // Format YYYY-MM-DD
    }

    // Extraire et valider les valeurs numériques
    const mileage = listingDetails.vehicle?.mileageInKmRaw
      ? parseInt(listingDetails.vehicle.mileageInKmRaw.toString())
      : 0;

    const power = listingDetails.vehicle?.rawPowerInKw
      ? parseInt(listingDetails.vehicle.rawPowerInKw.toString())
      : 0;

    const engineCapacity = listingDetails.vehicle?.rawDisplacementInCCM
      ? parseInt(listingDetails.vehicle.rawDisplacementInCCM.toString())
      : 0;

    const doors = listingDetails.vehicle?.numberOfDoors
      ? parseInt(listingDetails.vehicle.numberOfDoors.toString())
      : 5;

    const seats = listingDetails.vehicle?.numberOfSeats
      ? parseInt(listingDetails.vehicle.numberOfSeats.toString())
      : 5;

    let poidsVide = 0;
    if (listingDetails.vehicle?.weight) {
      const weight = listingDetails.vehicle.weight
        .toString()
        .replace(/[^\d]/g, "");
      poidsVide = weight ? parseInt(weight) : 0;
    }

    const year = listingDetails.vehicle?.firstRegistrationDateRaw
      ? new Date(listingDetails.vehicle.firstRegistrationDateRaw).getFullYear()
      : new Date().getFullYear();

    const priceSale = listingDetails.prices?.public?.priceRaw
      ? parseInt(listingDetails.prices.public.priceRaw.toString())
      : 0;

    // Récupérer le ID du véhicule
    const vehicleId = listingDetails.id || `vehicle-${Date.now()}`;

    // Télécharger et stocker les images sur Firebase Storage
    const photoUrls = listingDetails.images || [];
    const uploadedPhotos = [];

    if (photoUrls.length > 0) {
      for (let i = 0; i < Math.min(photoUrls.length, 5); i++) {
        try {
          // Télécharger l'image depuis l'URL
          const imgResponse = await axios.get(photoUrls[i], {
            responseType: "arraybuffer",
          });

          // Convertir les données de l'image en Blob
          const imgBlob = new Blob([imgResponse.data], {
            type: imgResponse.headers["content-type"] || "image/jpeg",
          });

          // Créer un nom de fichier unique pour l'image
          const fileExtension = photoUrls[i].split(".").pop() || "jpg";
          const fileName = `vehicles/${vehicleId}/photo_${
            i + 1
          }.${fileExtension}`;

          // Référence au fichier dans Storage
          const storageRef = ref(storage, fileName);

          // Uploader le fichier
          const uploadTask = await uploadBytesResumable(storageRef, imgBlob);

          // Obtenir l'URL de téléchargement
          const downloadURL = await getDownloadURL(uploadTask.ref);

          // Ajouter l'URL à la liste des photos téléchargées
          uploadedPhotos.push(downloadURL);
        } catch (imgError) {
          console.error(
            `Erreur lors du téléchargement de l'image ${i + 1}:`,
            imgError
          );
          // Si une image échoue, on continue avec les autres
        }
      }
    }

    // Structurer les données du véhicule pour la réponse
    const vehicleData = {
      brand: listingDetails.vehicle?.make || "",
      model: listingDetails.vehicle?.model || "",
      variant: listingDetails.vehicle?.modelVersionInput || "",
      chassisNumber: "",
      year: year,
      firstCirculationDate:
        firstCirculationDate || new Date().toISOString().split("T")[0],
      priceSale: priceSale,
      pricePurchase: 0,
      mileage: mileage,
      engineCapacity: engineCapacity,
      fuelType: (() => {
        const fuelCategory =
          listingDetails.vehicle?.fuelCategory?.formatted?.toLowerCase() || "";
        if (fuelCategory.includes("essence")) return "gasoline";
        if (fuelCategory.includes("diesel")) return "diesel";
        if (fuelCategory.includes("électrique")) return "electric";
        if (fuelCategory.includes("hybride")) return "hybrid";
        return "other";
      })(),
      transmission: listingDetails.vehicle?.transmissionType
        ?.toLowerCase()
        ?.includes("manuelle")
        ? "manual"
        : "automatic",
      power: power,
      poidsVide: poidsVide,
      color: listingDetails.vehicle?.bodyColor || "",
      doors: doors,
      seats: seats,
      status: "available",
      autoscoutId: vehicleId,
      options: options,
      // Utiliser les URLs des images stockées dans Firebase
      photos: uploadedPhotos,
      // Ajouter les horodatages
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(vehicleData);
  } catch (error) {
    console.error("Erreur lors du scraping:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'extraction des données du véhicule." },
      { status: 500 }
    );
  }
}

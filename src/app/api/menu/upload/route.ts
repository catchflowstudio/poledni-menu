import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSession } from "@/lib/auth/session";
import { uploadMenu } from "@/lib/menu/logic";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  WEBP_QUALITY,
} from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Ověř session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Nejste přihlášen." },
        { status: 401 }
      );
    }

    // Parsuj form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const date = formData.get("date") as string | null;

    if (!file || !date) {
      return NextResponse.json(
        { error: "Chybí soubor nebo datum." },
        { status: 400 }
      );
    }

    // Validace data (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Neplatný formát data." },
        { status: 400 }
      );
    }

    // Validace velikosti
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Soubor je příliš velký. Maximum je 10 MB." },
        { status: 400 }
      );
    }

    // Validace MIME typu
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: "Povolené formáty: JPG, PNG, WEBP." },
        { status: 400 }
      );
    }

    // Přečti soubor do bufferu
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ověření skutečného typu přes Sharp (ne jen MIME z headeru)
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      return NextResponse.json(
        { error: "Soubor není platný obrázek." },
        { status: 400 }
      );
    }

    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
      return NextResponse.json(
        { error: "Soubor není platný obrázek (JPG, PNG, WEBP)." },
        { status: 400 }
      );
    }

    // Zpracování obrázku přes Sharp
    const processedBuffer = await sharp(buffer)
      .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Upload
    const result = await uploadMenu(
      session.restaurantId,
      session.slug,
      date,
      processedBuffer
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Menu bylo úspěšně nahráno pro ${date}.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Chyba při nahrávání. Zkuste to znovu." },
      { status: 500 }
    );
  }
}

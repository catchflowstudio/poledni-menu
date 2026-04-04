import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSession } from "@/lib/auth/session";
import { uploadMenu } from "@/lib/menu/logic";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { logMenuUpload, logSecurityEvent } from "@/lib/security/logger";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_SHARP_FORMATS,
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  MAX_INPUT_PIXELS,
  WEBP_QUALITY,
} from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // CSRF
    if (!verifyCsrf(request)) {
      logSecurityEvent("csrf_rejected", { url: request.url });
      return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
    }

    // Session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nejste přihlášen." }, { status: 401 });
    }

    // Rate limit — max 20 uploadů za 15 min na restauraci
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`upload:${session.slug}:${ip}`, 20)) {
      logSecurityEvent("upload_rate_limited", { slug: session.slug, ip });
      return NextResponse.json({ error: "Příliš mnoho nahrávání. Zkuste to za chvíli." }, { status: 429 });
    }

    // Parsuj form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const date = formData.get("date") as string | null;
    const dateTo = formData.get("date_to") as string | null;

    if (!file || !date) {
      return NextResponse.json({ error: "Chybí soubor nebo datum." }, { status: 400 });
    }

    // Validace data (YYYY-MM-DD) — striktní regex
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Neplatný formát data." }, { status: 400 });
    }

    if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      return NextResponse.json({ error: "Neplatný formát data (do)." }, { status: 400 });
    }
    if (dateTo && dateTo < date) {
      return NextResponse.json({ error: "Datum 'do' musí být po datu 'od'." }, { status: 400 });
    }

    // Tvrdý limit na velikost
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Soubor je příliš velký. Maximum je 10 MB." }, { status: 400 });
    }

    // Kontrola MIME (první vrstva — klientem deklarovaný typ)
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      return NextResponse.json({ error: "Povolené formáty: JPG, PNG, WEBP." }, { status: 400 });
    }

    // Přečti soubor do bufferu
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Skutečné ověření typu souboru přes Sharp metadata ──
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      logSecurityEvent("invalid_image_upload", {
        slug: session.slug,
        declaredMime: file.type,
        fileSize: file.size,
      });
      return NextResponse.json({ error: "Soubor není platný obrázek." }, { status: 400 });
    }

    // Ověř skutečný formát (ne MIME header, ale binární magic bytes přes Sharp)
    if (!metadata.format || !ALLOWED_SHARP_FORMATS.includes(metadata.format as (typeof ALLOWED_SHARP_FORMATS)[number])) {
      logSecurityEvent("format_mismatch", {
        slug: session.slug,
        declaredMime: file.type,
        actualFormat: metadata.format ?? "unknown",
      });
      return NextResponse.json({ error: "Soubor není platný obrázek (JPG, PNG, WEBP)." }, { status: 400 });
    }

    // Tvrdý limit na pixelové rozměry vstupu
    const inputPixels = (metadata.width ?? 0) * (metadata.height ?? 0);
    if (inputPixels > MAX_INPUT_PIXELS) {
      return NextResponse.json(
        { error: `Obrázek je příliš velký (max ${Math.round(MAX_INPUT_PIXELS / 1_000_000)} Mpx).` },
        { status: 400 }
      );
    }

    // ── Re-encode přes Sharp — strip EXIF, normalizuj formát ──
    const processedBuffer = await sharp(buffer)
      .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .rotate() // auto-rotate podle EXIF, pak strip
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Upload (session.slug zajišťuje tenant izolaci — cesta je slug/date.webp)
    const result = await uploadMenu(
      session.restaurantId,
      session.slug,
      date,
      processedBuffer,
      dateTo || undefined
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    logMenuUpload(session.slug, date, session.restaurantId);

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

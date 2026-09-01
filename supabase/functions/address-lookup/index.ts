/**
 * Sugestão de endereço para o formulário de ficha.
 *
 * Fica no servidor para a chave do Google não viajar no JavaScript do app.
 * Duas ações:
 *  - suggest: o que aparece enquanto a pessoa digita;
 *  - details: os campos separados do endereço escolhido.
 *
 * As duas compartilham um sessionToken. O Google cobra a sessão inteira como
 * uma consulta só, em vez de uma por tecla digitada.
 *
 * Segredo necessário: GOOGLE_TRANSLATE_API_KEY (mesma chave do projeto, com a
 * Places API habilitada).
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function responder(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

type Sugestao = { placeId: string; principal: string; secundario: string };

async function sugerir(chave: string, texto: string, sessionToken: string) {
  const resposta = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": chave,
    },
    body: JSON.stringify({
      input: texto,
      sessionToken,
      // Só endereço de rua: obra não fica em "restaurante tal".
      includedPrimaryTypes: ["street_address", "premise", "subpremise", "route"],
      includedRegionCodes: ["us"],
    }),
  });

  const corpo = await resposta.json();
  if (!resposta.ok) {
    throw new Error(corpo?.error?.message ?? `Google respondeu ${resposta.status}`);
  }

  const sugestoes: Sugestao[] = (corpo?.suggestions ?? [])
    .filter((s: Record<string, unknown>) => s.placePrediction)
    .map((s: Record<string, any>) => ({
      placeId: s.placePrediction.placeId,
      principal: s.placePrediction.structuredFormat?.mainText?.text ?? "",
      secundario: s.placePrediction.structuredFormat?.secondaryText?.text ?? "",
    }));

  return sugestoes.slice(0, 5);
}

async function detalhar(chave: string, placeId: string, sessionToken: string) {
  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
  url.searchParams.set("sessionToken", sessionToken);

  const resposta = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": chave,
      // Só os componentes do endereço: é o nível mais barato da cobrança.
      "X-Goog-FieldMask": "addressComponents,formattedAddress",
    },
  });

  const corpo = await resposta.json();
  if (!resposta.ok) {
    throw new Error(corpo?.error?.message ?? `Google respondeu ${resposta.status}`);
  }

  const partes: Record<string, string> = {};
  for (const c of corpo?.addressComponents ?? []) {
    for (const tipo of c.types ?? []) {
      // shortText para o estado ("RI"), longText para o resto.
      partes[tipo] = tipo === "administrative_area_level_1" ? c.shortText : c.longText;
    }
  }

  const numero = partes.street_number ?? "";
  const rua = partes.route ?? "";

  return {
    street: [numero, rua].filter(Boolean).join(" "),
    unit: partes.subpremise ?? "",
    // Cidade pequena às vezes vem só como sublocality ou town.
    city:
      partes.locality ??
      partes.postal_town ??
      partes.sublocality_level_1 ??
      partes.administrative_area_level_2 ??
      "",
    state: partes.administrative_area_level_1 ?? "",
    zip: partes.postal_code ?? "",
    formatted: corpo?.formattedAddress ?? "",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const chave = Deno.env.get("GOOGLE_TRANSLATE_API_KEY");
  if (!chave) return responder({ error: "Busca de endereço não configurada." }, 503);

  let corpo: { action?: string; query?: string; placeId?: string; sessionToken?: string };
  try {
    corpo = await req.json();
  } catch {
    return responder({ error: "Corpo inválido." }, 400);
  }

  const sessionToken = corpo.sessionToken ?? crypto.randomUUID();

  try {
    if (corpo.action === "suggest") {
      const texto = (corpo.query ?? "").trim();
      // Menos de 3 letras só devolve ruído e gasta consulta à toa.
      if (texto.length < 3) return responder({ suggestions: [] });
      return responder({ suggestions: await sugerir(chave, texto, sessionToken) });
    }

    if (corpo.action === "details") {
      if (!corpo.placeId) return responder({ error: "Informe placeId." }, 400);
      return responder({ address: await detalhar(chave, corpo.placeId, sessionToken) });
    }

    return responder({ error: "Ação desconhecida." }, 400);
  } catch (erro) {
    return responder({ error: erro instanceof Error ? erro.message : String(erro) }, 502);
  }
});

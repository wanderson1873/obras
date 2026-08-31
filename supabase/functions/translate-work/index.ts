/**
 * Traduz o conteúdo escrito de uma obra para os idiomas do app.
 *
 * Chamada pelo app logo depois de salvar a ficha. Lê a obra com o token de
 * quem chamou — então o RLS garante que ninguém mande traduzir obra alheia —
 * e grava as traduções com a chave de serviço.
 *
 * Fora do tradutor de propósito:
 * - endereço, cidade e código: nome de rua e senha de porta têm de chegar
 *   idênticos ao que foi escrito;
 * - atualizações com system_key: são texto do próprio app e já existem
 *   traduzidas no dicionário da interface.
 *
 * Segredo necessário no projeto: GOOGLE_TRANSLATE_API_KEY.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const IDIOMAS = ["pt", "en", "es"] as const;
type Idioma = (typeof IDIOMAS)[number];

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

/** O Google devolve pt-BR, pt-PT, en-US... e o app só conhece a raiz. */
function raiz(tag: string | undefined): Idioma | null {
  const base = (tag ?? "").toLowerCase().split("-")[0];
  return (IDIOMAS as readonly string[]).includes(base) ? (base as Idioma) : null;
}

type Pedaco = { entity_id: string; field: string; texto: string };

async function traduzir(chave: string, textos: string[], destino: Idioma, origem: Idioma) {
  const resposta = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${chave}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: textos, source: origem, target: destino, format: "text" }),
    },
  );
  const corpo = await resposta.json();
  if (!resposta.ok) {
    throw new Error(corpo?.error?.message ?? `Google respondeu ${resposta.status}`);
  }
  return (corpo?.data?.translations ?? []).map((t: { translatedText: string }) => t.translatedText);
}

async function detectar(chave: string, texto: string): Promise<Idioma | null> {
  const resposta = await fetch(
    `https://translation.googleapis.com/language/translate/v2/detect?key=${chave}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: [texto] }),
    },
  );
  const corpo = await resposta.json();
  if (!resposta.ok) return null;
  return raiz(corpo?.data?.detections?.[0]?.[0]?.language);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const chave = Deno.env.get("GOOGLE_TRANSLATE_API_KEY");
  if (!chave) return responder({ error: "Tradutor não configurado." }, 500);

  const autorizacao = req.headers.get("Authorization");
  if (!autorizacao) return responder({ error: "Sem autorização." }, 401);

  let workId: string;
  try {
    workId = (await req.json())?.work_id;
    if (!workId) throw new Error();
  } catch {
    return responder({ error: "Informe work_id." }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL")!;

  const comoUsuario = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: autorizacao } },
  });

  const { data: obra, error: erroLeitura } = await comoUsuario
    .from("works")
    .select(
      "id, service, description, observations, work_tasks (id, label), work_updates (id, text, system_key)",
    )
    .eq("id", workId)
    .maybeSingle();

  if (erroLeitura) return responder({ error: erroLeitura.message }, 400);
  if (!obra) return responder({ error: "Obra não encontrada." }, 404);

  const pedacos: Pedaco[] = [];
  const juntar = (entity_id: string, field: string, texto: string | null) => {
    if (texto && texto.trim().length > 1) pedacos.push({ entity_id, field, texto: texto.trim() });
  };

  juntar(obra.id, "service", obra.service);
  juntar(obra.id, "description", obra.description);
  juntar(obra.id, "observations", obra.observations);
  for (const tarefa of obra.work_tasks ?? []) juntar(tarefa.id, "label", tarefa.label);
  for (const nota of obra.work_updates ?? []) {
    if (nota.system_key) continue;
    juntar(nota.id, "text", nota.text);
  }

  const servico = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Some com tradução de tarefa apagada ou texto reescrito.
  await servico.from("content_translations").delete().eq("work_id", obra.id);

  if (pedacos.length === 0) return responder({ ok: true, traduzidos: 0, motivo: "nada a traduzir" });

  // Uma detecção só, no texto mais longo: é o que melhor representa a ficha.
  const maisLongo = pedacos.reduce((a, b) => (b.texto.length > a.texto.length ? b : a)).texto;
  const origem = await detectar(chave, maisLongo);
  if (!origem) return responder({ ok: false, motivo: "idioma de origem não reconhecido" });

  const linhas: Record<string, unknown>[] = [];
  for (const destino of IDIOMAS) {
    if (destino === origem) continue;
    const traduzidos = await traduzir(chave, pedacos.map((p) => p.texto), destino, origem);
    traduzidos.forEach((texto: string, i: number) => {
      linhas.push({
        work_id: obra.id,
        entity_id: pedacos[i].entity_id,
        field: pedacos[i].field,
        lang: destino,
        translated: texto,
        updated_at: new Date().toISOString(),
      });
    });
  }

  if (linhas.length > 0) {
    const { error } = await servico.from("content_translations").insert(linhas);
    if (error) return responder({ error: error.message }, 500);
  }

  await servico.from("works").update({ source_lang: origem }).eq("id", obra.id);

  return responder({ ok: true, origem, traduzidos: linhas.length });
});

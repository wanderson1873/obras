/**
 * Seleção de fotos: abre a câmera ou a galeria do aparelho, comprime cada
 * arquivo e entrega os blobs prontos para subir ao Storage.
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { compressImageFile } from "@/lib/photos";

export function usePhotoPicker(
  onPicked: (files: Blob[]) => Promise<void> | void
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const open = useCallback(() => inputRef.current?.click(), []);

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      // Permite escolher o mesmo arquivo de novo depois de remover.
      event.target.value = "";
      if (!files.length) return;

      setBusy(true);
      try {
        const compressed = await Promise.all(files.map(compressImageFile));
        await onPicked(compressed);
      } catch (error) {
        console.error("Falha ao processar a foto.", error);
        toast.error("Não foi possível preparar a foto", {
          description: "Tente outra imagem.",
        });
      } finally {
        setBusy(false);
      }
    },
    [onPicked]
  );

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handleChange}
      aria-hidden="true"
      tabIndex={-1}
    />
  );

  return { open, busy, input };
}

/**
 * Seleção de fotos: abre a câmera ou a galeria do aparelho, comprime cada
 * arquivo e entrega os blobs prontos para subir ao Storage.
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { compressImageFile } from "@/lib/photos";
import { useT } from "@/i18n/I18nContext";

export function usePhotoPicker(
  onPicked: (files: Blob[]) => Promise<void> | void
) {
  const t = useT();
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
        toast.error(t("toast.photoPrepFailed"), {
          description: t("toast.photoPrepHint"),
        });
      } finally {
        setBusy(false);
      }
    },
    [onPicked, t]
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

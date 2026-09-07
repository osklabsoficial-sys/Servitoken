/**
 * ============================================================
 *  SERVITOKEN · Fondo aurora para paneles privados
 * ============================================================
 *  Capa decorativa fija detrás del contenido: tres blobs
 *  con degradado eléctrico/dorado/verde que derivan lento.
 *  pointer-events: none → nunca bloquea la interacción.
 * ============================================================
 */
export function AuroraBackground() {
  return (
    <div className="aurora-scene" aria-hidden>
      <span className="aurora-blob aurora-a" />
      <span className="aurora-blob aurora-b" />
      <span className="aurora-blob aurora-c" />
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../api";
import Modal from "./Modal";
import { Upload, Star, Trash2 } from "lucide-react";

export default function ImagesModal({ produit, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/images-produits", {
        params: { produit_id: produit.id },
      });

      console.log("IMAGES API:", data);
      console.log("FIRST IMAGE:", data.data?.[0]);

      setImages(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("produit_id", produit.id);
    formData.append("image", file);
    formData.append("principale", images.length === 0 ? "1" : "0");

    try {
      await api.post("/images-produits", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSetPrincipale(id) {
    try {
      await api.put(`/images-produits/${id}`, { principale: true });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await api.delete(`/images-produits/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Modal title={`Images — ${produit.nom}`} onClose={onClose}>
      <div className="space-y-4">
        <label className="flex items-center justify-center gap-2 border border-dashed border-line rounded p-4 text-sm text-muted hover:border-copper hover:text-copper cursor-pointer transition-colors">
          <Upload size={16} strokeWidth={1.75} />
          {uploading ? "Envoi…" : "Ajouter une image"}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-muted text-sm font-mono">Chargement…</div>
        ) : images.length === 0 ? (
          <div className="text-muted text-sm text-center py-4">
            Aucune image pour l'instant.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.url}
                  alt=""
                  className="w-full aspect-square object-cover rounded border border-line"
                />
                {img.principale && (
                  <span className="absolute top-1 left-1 bg-copper text-base text-[10px] font-mono px-1.5 py-0.5 rounded">
                    Principale
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded">
                  {!img.principale && (
                    <button
                      onClick={() => handleSetPrincipale(img.id)}
                      title="Définir comme principale"
                      className="p-1.5 bg-panel rounded text-teal hover:bg-panel2"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    title="Supprimer"
                    className="p-1.5 bg-panel rounded text-danger hover:bg-panel2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

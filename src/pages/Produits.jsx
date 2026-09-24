import { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import { Package, Plus, Pencil, Trash2, ImageIcon, Store } from "lucide-react";
import ImagesModal from "../components/ImagesModal";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  nom: "",
  description: "",
  prix: "",
  stock: "",
  marque: "",
  modele: "",
  category_id: "",
  disponible: true,
};

export default function Produits() {
  const { user } = useAuth();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [imagesFor, setImagesFor] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [produitsRes, categoriesRes] = await Promise.all([
        api.get("/produits?dashboard=1&per_page=50"),
        api.get("/categories"),
      ]);
      setProduits(produitsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Vérification de sécurité: seul le propriétaire de la boutique ou super_admin peut modifier
  const canModify = (produit) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    if (user.role === "vendeur") {
      const boutiqueUserId = produit.boutique?.user_id;
      const boutiqueId = produit.boutique?.id;
      const userBoutiqueId = user.boutique?.id;

      if (boutiqueUserId && Number(boutiqueUserId) === Number(user.id)) return true;
      if (boutiqueId && userBoutiqueId && Number(boutiqueId) === Number(userBoutiqueId)) return true;
      return false;
    }
    return false;
  };

  // Filtrer les produits pour le vendeur afin qu'il ne voie QUE ses propres produits
  const displayedProduits = user?.role === "vendeur"
    ? produits.filter((p) => {
        // Si le backend a déjà filtré ou si on vérifie localement
        if (!p.boutique) return true;
        const bUserId = p.boutique.user_id;
        const bId = p.boutique.id;
        const uBId = user.boutique?.id;
        if (bUserId && Number(bUserId) === Number(user.id)) return true;
        if (bId && uBId && Number(bId) === Number(uBId)) return true;
        return false;
      })
    : produits;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(produit) {
    if (!canModify(produit)) {
      alert("Vous n'avez pas l'autorisation de modifier ce produit.");
      return;
    }

    setEditing(produit);
    setForm({
      nom: produit.nom,
      description: produit.description || "",
      prix: produit.prix,
      stock: produit.stock,
      marque: produit.marque || "",
      modele: produit.modele || "",
      category_id: produit.category?.id || "",
      disponible: produit.disponible,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (editing && !canModify(editing)) {
      setError("Action non autorisée.");
      return;
    }

    try {
      if (editing) {
        await api.put(`/produits/${editing.id}`, form);
      } else {
        await api.post("/produits", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    }
  }

  async function handleDelete(produit) {
    if (!canModify(produit)) {
      alert("Vous n'avez pas l'autorisation de supprimer ce produit.");
      return;
    }

    if (!confirm(`Supprimer le produit "${produit.nom}" ?`)) return;
    try {
      await api.delete(`/produits/${produit.id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Suppression impossible.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-copper" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight flex items-center gap-2">
              <span>Produits</span>
              {user?.role === "vendeur" && user?.boutique?.nom && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-panel text-teal border border-teal/30 flex items-center gap-1">
                  <Store size={12} />
                  {user.boutique.nom}
                </span>
              )}
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {user?.role === "vendeur"
                ? "Gérez les produits de votre boutique"
                : "Gestion globale de tous les produits du centre"}
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-copper hover:bg-copper/90 text-base font-medium text-sm rounded px-3.5 py-2 transition-colors cursor-pointer"
        >
          <Plus size={16} strokeWidth={2} />
          Ajouter
        </button>
      </div>

      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : displayedProduits.length === 0 ? (
        <div className="text-muted text-sm border border-dashed border-line rounded p-8 text-center space-y-2">
          <Package size={32} className="mx-auto text-muted/50" />
          <p>Aucun produit pour l'instant.</p>
          <button
            onClick={openCreate}
            className="text-xs font-mono text-copper hover:underline"
          >
            + Ajouter votre premier produit
          </button>
        </div>
      ) : (
        <div className="border border-line rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel2 text-muted text-xs font-mono text-left">
                <th className="px-4 py-2.5 font-normal">Produit</th>
                {user?.role === "super_admin" && (
                  <th className="px-4 py-2.5 font-normal">Boutique</th>
                )}
                <th className="px-4 py-2.5 font-normal text-right">Prix</th>
                <th className="px-4 py-2.5 font-normal text-right">Stock</th>
                <th className="px-4 py-2.5 font-normal"></th>
              </tr>
            </thead>

            <tbody>
              {displayedProduits.map((p) => {
                const isOwner = canModify(p);
                return (
                  <tr key={p.id} className="border-t border-line hover:bg-panel/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-ink font-medium">{p.nom}</div>
                      <div className="text-muted text-xs">{p.category?.nom || "Non catégorisé"}</div>
                    </td>

                    {user?.role === "super_admin" && (
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-panel font-mono text-copper border border-line">
                          {p.boutique?.nom || "Sans boutique"}
                        </span>
                      </td>
                    )}

                    <td className="px-4 py-3 text-right font-mono text-ink">
                      {Number(p.prix).toLocaleString("fr-MA")} DH
                    </td>

                    <td className="px-4 py-3 text-right font-mono">
                      <span className={p.stock <= 2 ? "text-danger font-bold" : "text-ink"}>
                        {p.stock}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Images */}
                        <button
                          onClick={() => setImagesFor(p)}
                          className="p-1.5 text-muted hover:text-ink transition-colors cursor-pointer"
                          title="Images"
                        >
                          <ImageIcon size={15} strokeWidth={1.75} />
                        </button>

                        {/* Modifier (visible uniquement si propriétaire ou admin) */}
                        {isOwner && (
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-muted hover:text-ink transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Pencil size={15} strokeWidth={1.75} />
                          </button>
                        )}

                        {/* Supprimer (visible uniquement si propriétaire ou admin) */}
                        {isOwner && (
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-muted hover:text-danger transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajouter / Modifier */}
      {modalOpen && (
        <Modal
          title={editing ? "Modifier le produit" : "Ajouter un produit"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-xs font-mono text-danger bg-danger/10 border border-danger/20 rounded p-2.5">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-muted mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full bg-panel border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-copper"
                placeholder="Ex: iPhone 13 Pro Max"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Prix (DH) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  className="w-full bg-panel border border-line rounded px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-copper"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-panel border border-line rounded px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:border-copper"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Catégorie *
                </label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full bg-panel border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-copper"
                >
                  <option value="">Sélectionner…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  value={form.marque}
                  onChange={(e) => setForm({ ...form, marque: e.target.value })}
                  className="w-full bg-panel border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-copper"
                  placeholder="Ex: Apple, Samsung"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">
                Modèle
              </label>
              <input
                type="text"
                value={form.modele}
                onChange={(e) => setForm({ ...form, modele: e.target.value })}
                className="w-full bg-panel border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-copper"
                placeholder="Ex: A2633"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-panel border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-copper resize-none"
                placeholder="Détails, garantie, état…"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="disponible"
                checked={form.disponible}
                onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                className="rounded border-line bg-panel text-copper focus:ring-0"
              />
              <label htmlFor="disponible" className="text-xs font-mono text-muted cursor-pointer">
                Produit disponible à la vente
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-2 text-xs font-mono text-muted hover:text-ink transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-copper hover:bg-copper/90 text-base font-medium text-xs font-mono rounded px-4 py-2 transition-colors cursor-pointer"
              >
                {editing ? "Enregistrer" : "Créer le produit"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Gestion des Images */}
      {imagesFor && (
        <ImagesModal
          produit={imagesFor}
          onClose={() => setImagesFor(null)}
          onImagesUpdated={load}
        />
      )}
    </div>
  );
}

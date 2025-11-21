import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Save,
  X,
  Star,
  LayoutGrid,
} from "lucide-react";

// On injecte Tailwind CSS via JS pour simplifier l'installation pour toi
const TailwindInjector = () => (
  <link
    href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
    rel="stylesheet"
  />
);

const API_URL = "http://localhost:3000/api";

export default function App() {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [filters, setFilters] = useState({ search: "", genre: "" });

  const initialForm = {
    titre: "",
    genre: "",
    plateforme: "",
    editeur: "",
    annee_sortie: 2023,
    metacritic_score: 0,
    temps_jeu_heures: 0,
    termine: false,
  };
  const [formData, setFormData] = useState(initialForm);

  // 1. CHARGEMENT DES DONNÉES (GET)
  const fetchGames = async () => {
    try {
      // Construction de l'URL avec filtres
      let url = `${API_URL}/games?`;
      if (filters.genre) url += `genre=${filters.genre}&`;

      const res = await fetch(url);
      const data = await res.json();

      // Filtrage recherche texte (côté client pour simplifier)
      const filtered = data.filter((g) =>
        g.titre.toLowerCase().includes(filters.search.toLowerCase())
      );
      setGames(filtered);
      setLoading(false);
    } catch (err) {
      console.error("Erreur fetch games", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      setStats(await res.json());
    } catch (err) {
      console.error("Erreur stats", err);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchStats();
  }, [filters]); // Recharger si les filtres changent

  // 2. GESTION FORMULAIRE (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      genre:
        typeof formData.genre === "string"
          ? formData.genre.split(",").map((s) => s.trim())
          : formData.genre,
      plateforme:
        typeof formData.plateforme === "string"
          ? formData.plateforme.split(",").map((s) => s.trim())
          : formData.plateforme,
      annee_sortie: parseInt(formData.annee_sortie),
      metacritic_score: parseInt(formData.metacritic_score),
      temps_jeu_heures: parseFloat(formData.temps_jeu_heures),
    };

    const method = editingGame ? "PUT" : "POST";
    const url = editingGame
      ? `${API_URL}/games/${editingGame._id}`
      : `${API_URL}/games`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsFormOpen(false);
    setEditingGame(null);
    setFormData(initialForm);
    fetchGames();
    fetchStats();
  };

  // 3. ACTIONS (DELETE / FAVORIS)
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce jeu ?")) {
      await fetch(`${API_URL}/games/${id}`, { method: "DELETE" });
      fetchGames();
      fetchStats();
    }
  };

  const toggleFavorite = async (id) => {
    await fetch(`${API_URL}/games/${id}/favorite`, { method: "POST" });
    fetchGames();
  };

  const openEdit = (game) => {
    setEditingGame(game);
    setFormData({
      ...game,
      genre: game.genre.join(", "),
      plateforme: game.plateforme.join(", "),
    });
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans pb-10">
      <TailwindInjector />

      {/* HEADER */}
      <div className="bg-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutGrid /> Game Collection
            </h1>
            <p className="text-indigo-200 text-sm mt-1">TP MongoDB & React</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 flex items-center gap-2"
          >
            <Plus size={20} /> Ajouter un Jeu
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Jeux"
            value={stats.totalJeux || 0}
            color="bg-blue-500"
          />
          <StatCard
            label="Heures Jouées"
            value={(stats.tempsTotal || 0) + "h"}
            color="bg-purple-500"
          />
          <StatCard
            label="Jeux Finis"
            value={stats.jeuxTermines || 0}
            color="bg-green-500"
          />
          <StatCard
            label="Score Moyen"
            value={(stats.scoreMoyen || 0).toFixed(1)}
            color="bg-yellow-500"
          />
        </div>

        {/* FILTRES */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un titre..."
              className="w-full pl-10 p-2 border rounded-lg"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <select
            className="p-2 border rounded-lg"
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="">Tous les genres</option>
            <option value="RPG">RPG</option>
            <option value="Action">Action</option>
            <option value="Aventure">Aventure</option>
          </select>
        </div>

        {/* LISTE DES JEUX */}
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 relative border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {game.titre}
                  </h3>
                  <button
                    onClick={() => toggleFavorite(game._id)}
                    className="text-yellow-400 hover:scale-110 transition"
                  >
                    <Star fill={game.favorite ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {game.plateforme.map((p, i) => (
                    <span
                      key={i}
                      className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                    >
                      {p}
                    </span>
                  ))}
                  {game.genre.map((g, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Éditeur:</span>{" "}
                    <span className="font-medium">{game.editeur}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Année:</span>{" "}
                    <span className="font-medium">{game.annee_sortie}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metacritic:</span>{" "}
                    <span
                      className={`font-bold ${
                        game.metacritic_score > 80
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {game.metacritic_score}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps:</span>{" "}
                    <span className="font-medium">
                      {game.temps_jeu_heures}h
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      game.termine
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {game.termine ? "TERMINÉ" : "EN COURS"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(game)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(game._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FORMULAIRE */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingGame ? "Modifier" : "Nouveau Jeu"}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="border p-2 rounded"
                  placeholder="Titre"
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData({ ...formData, titre: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  placeholder="Année"
                  value={formData.annee_sortie}
                  onChange={(e) =>
                    setFormData({ ...formData, annee_sortie: e.target.value })
                  }
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Genres (ex: RPG, Action)"
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Plateformes (ex: PC, PS5)"
                  value={formData.plateforme}
                  onChange={(e) =>
                    setFormData({ ...formData, plateforme: e.target.value })
                  }
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Éditeur"
                  value={formData.editeur}
                  onChange={(e) =>
                    setFormData({ ...formData, editeur: e.target.value })
                  }
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Développeur"
                  value={formData.developpeur}
                  onChange={(e) =>
                    setFormData({ ...formData, developpeur: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  placeholder="Score Metacritic"
                  value={formData.metacritic_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metacritic_score: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  placeholder="Heures de jeu"
                  value={formData.temps_jeu_heures}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temps_jeu_heures: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.termine}
                  onChange={(e) =>
                    setFormData({ ...formData, termine: e.target.checked })
                  }
                  className="h-5 w-5"
                />
                <label>Jeu terminé</label>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2"
              >
                <Save /> Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ label, value, color }) => (
  <div className={`${color} text-white p-4 rounded-xl shadow`}>
    <div className="text-blue-100 text-sm font-medium">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

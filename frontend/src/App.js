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
  Clock,
  Trophy,
  Gamepad2,
  Activity,
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
      let url = `${API_URL}/games?`;
      if (filters.genre) url += `genre=${filters.genre}&`;

      const res = await fetch(url);
      const data = await res.json();

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
  }, [filters]);

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
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      <TailwindInjector />

      {/* HEADER */}
      <div className="bg-indigo-700 text-white p-6 shadow-lg mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutGrid className="opacity-80" /> Ma Collection
            </h1>
            <p className="text-indigo-200 text-sm mt-1 font-medium">
              Dashboard MongoDB & React
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-50 shadow-md transition flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} /> Nouveau Jeu
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* NOUVELLES STATS AVEC LABELS ET ICÔNES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            label="Total Collection"
            value={stats.totalJeux || 0}
            unit="Jeux"
            icon={<Gamepad2 size={28} />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            label="Temps de Jeu"
            value={stats.tempsTotal || 0}
            unit="Heures"
            icon={<Clock size={28} />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            label="Jeux Terminés"
            value={stats.jeuxTermines || 0}
            unit="Complétés"
            icon={<Trophy size={28} />}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            label="Qualité Moyenne"
            value={stats.scoreMoyen ? Math.round(stats.scoreMoyen) : 0}
            unit="/ 100"
            icon={<Activity size={28} />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
        </div>

        {/* BARRE DE FILTRES */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 mb-8 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un jeu par titre..."
              className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <select
            className="p-2.5 border border-gray-200 rounded-lg bg-white min-w-[200px] outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="">Tous les genres</option>
            <option value="RPG">RPG</option>
            <option value="Action">Action</option>
            <option value="Aventure">Aventure</option>
            <option value="FPS">FPS</option>
            <option value="Stratégie">Stratégie</option>
          </select>
        </div>

        {/* LISTE DES JEUX */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Chargement de la collection...
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              Aucun jeu trouvé. Commencez par en ajouter un !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 relative border border-gray-100 flex flex-col group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className="text-lg font-bold text-gray-800 line-clamp-1"
                    title={game.titre}
                  >
                    {game.titre}
                  </h3>
                  <button
                    onClick={() => toggleFavorite(game._id)}
                    className="text-gray-300 hover:text-yellow-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={22}
                      fill={game.favorite ? "#FBBF24" : "none"}
                      className={game.favorite ? "text-yellow-400" : ""}
                    />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {game.plateforme.map((p, i) => (
                    <span
                      key={i}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide"
                    >
                      {p}
                    </span>
                  ))}
                  {game.genre.map((g, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 border border-gray-200 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-600 space-y-2 mb-4 flex-grow">
                  <div className="flex justify-between border-b border-gray-50 pb-1">
                    <span className="text-gray-400">Éditeur</span>
                    <span className="font-medium text-gray-800">
                      {game.editeur}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-1">
                    <span className="text-gray-400">Sortie</span>
                    <span className="font-medium text-gray-800">
                      {game.annee_sortie}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-1">
                    <span className="text-gray-400">Score</span>
                    <span
                      className={`font-bold px-1.5 rounded ${
                        game.metacritic_score >= 80
                          ? "bg-green-100 text-green-700"
                          : game.metacritic_score >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {game.metacritic_score}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temps</span>
                    <span className="font-medium text-gray-800 flex items-center gap-1">
                      <Clock size={14} /> {game.temps_jeu_heures}h
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      game.termine
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        game.termine ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    ></div>
                    {game.termine ? "TERMINÉ" : "EN COURS"}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(game)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(game._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingGame ? "Modifier le jeu" : "Ajouter un jeu"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du jeu
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.titre}
                    onChange={(e) =>
                      setFormData({ ...formData, titre: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année de sortie
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.annee_sortie}
                    onChange={(e) =>
                      setFormData({ ...formData, annee_sortie: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genres (séparés par virgule)
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: RPG, Action"
                    value={formData.genre}
                    onChange={(e) =>
                      setFormData({ ...formData, genre: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plateformes (séparées par virgule)
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: PC, PS5"
                    value={formData.plateforme}
                    onChange={(e) =>
                      setFormData({ ...formData, plateforme: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Éditeur
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.editeur}
                    onChange={(e) =>
                      setFormData({ ...formData, editeur: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score Metacritic (0-100)
                  </label>
                  <input
                    type="number"
                    max="100"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.metacritic_score}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metacritic_score: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heures de jeu
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.temps_jeu_heures}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        temps_jeu_heures: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <input
                  type="checkbox"
                  id="termine"
                  checked={formData.termine}
                  onChange={(e) =>
                    setFormData({ ...formData, termine: e.target.checked })
                  }
                  className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="termine"
                  className="font-medium text-gray-700 cursor-pointer"
                >
                  J'ai terminé ce jeu (100%)
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition flex justify-center gap-2 items-center"
                >
                  <Save size={18} /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// NOUVEAU COMPOSANT CARTE STATISTIQUE
const StatCard = ({ label, value, unit, color, icon }) => (
  <div
    className={`${color} text-white p-6 rounded-xl shadow-lg flex items-center gap-4 transform hover:scale-105 transition duration-200`}
  >
    <div className="p-3 bg-white bg-opacity-20 rounded-lg shadow-sm">
      {icon}
    </div>
    <div>
      <div className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm font-medium opacity-90">{unit}</span>
      </div>
    </div>
  </div>
);

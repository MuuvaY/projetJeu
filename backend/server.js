const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// ⚠️ URL SPÉCIALE DOCKER ⚠️
// On se connecte en tant qu'admin (défini dans docker-compose)
const MONGODB_URI =
  "mongodb://admin:password@localhost:27017/game_collection_db?authSource=admin";
const DB_NAME = "game_collection_db";
const COLLECTION_NAME = "games";

let gamesCollection;

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    gamesCollection = db.collection(COLLECTION_NAME);
    console.log("✅ Connecté à MongoDB via Docker");
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error);
    // On ne coupe pas le process pour permettre de relancer docker sans relancer node
  }
}

// --- VALIDATION ---
function validateGame(data) {
  const errors = [];
  if (!data.titre) errors.push("Le titre est requis");
  if (!data.genre || !Array.isArray(data.genre))
    errors.push("Le genre doit être une liste");
  if (!data.plateforme || !Array.isArray(data.plateforme))
    errors.push("La plateforme doit être une liste");
  return errors;
}

// --- ROUTES ---

// 1. GET (Liste avec filtres)
app.get("/api/games", async (req, res) => {
  try {
    const { genre, plateforme } = req.query;
    let query = {};
    if (genre) query.genre = { $regex: genre, $options: "i" }; // Recherche souple
    if (plateforme) query.plateforme = { $regex: plateforme, $options: "i" };

    const games = await gamesCollection.find(query).toArray();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. STATS
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await gamesCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalJeux: { $sum: 1 },
            tempsTotal: { $sum: "$temps_jeu_heures" },
            jeuxTermines: { $sum: { $cond: ["$termine", 1, 0] } },
            scoreMoyen: { $avg: "$metacritic_score" },
          },
        },
      ])
      .toArray();
    res.json(stats[0] || { totalJeux: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST (Ajouter)
app.post("/api/games", async (req, res) => {
  const errors = validateGame(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const newGame = {
      ...req.body,
      date_ajout: new Date(),
      favorite: false, // Par défaut
    };
    const result = await gamesCollection.insertOne(newGame);
    res.status(201).json({ ...newGame, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. PUT (Modifier)
app.put("/api/games/:id", async (req, res) => {
  try {
    const { _id, ...updateData } = req.body; // On retire _id du body pour ne pas le modifier
    await gamesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updateData, date_modification: new Date() } }
    );
    res.json({ message: "Mise à jour réussie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE (Supprimer)
app.delete("/api/games/:id", async (req, res) => {
  try {
    await gamesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. FAVORIS
app.post("/api/games/:id/favorite", async (req, res) => {
  try {
    const game = await gamesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    await gamesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { favorite: !game.favorite } }
    );
    res.json({ message: "Favori changé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Serveur API lancé sur http://localhost:${PORT}`);
});

-- Skapa topplista tabell
CREATE TABLE IF NOT EXISTS high_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index för snabbare sortering
CREATE INDEX IF NOT EXISTS idx_score ON high_scores(score DESC);

-- Lägg till några test-poäng
INSERT INTO high_scores (name, score) VALUES 
('Kung Carl XVI Gustaf', 150),
('Kronprinsessan Victoria', 120),
('Prins Daniel', 100),
('Prinsessan Estelle', 80),
('Prins Oscar', 60); 
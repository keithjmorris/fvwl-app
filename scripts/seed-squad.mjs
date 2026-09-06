import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = {
  apiKey: "YAIzaSyAvITdQHZkF-Kjkacna0fsxPYqbBEKJwlg",
  authDomain: "fvwl-8109b.firebaseapp.com",
  projectId: "fvwl-8109b",
  storageBucket: "fvwl-8109b.firebasestorage.app",
  messagingSenderId: "406636067359",
  appId: "1:406636067359:web:8b70673d38495254b2f32a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const data = JSON.parse(readFileSync('./squad_data.json', 'utf8'));

await setDoc(doc(db, 'fvwl', 'squad'), {
  ...data,
  updatedAt: new Date().toISOString(),
});

console.log(`✅ Seeded ${data.players.length} players and ${data.budgetItems.length} budget items to Firestore`);
process.exit(0);

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvITdQHZkF-Kjkacna0fsxPYqbBEKJwlg",
  authDomain: "fvwl-8109b.firebaseapp.com",
  databaseURL: "https://fvwl-8109b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fvwl-8109b",
  storageBucket: "fvwl-8109b.firebasestorage.app",
  messagingSenderId: "406636067359",
  appId: "1:406636067359:web:8b70673d38495254b2f32a"
};

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export async function GET() {
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, 'fvwl', 'squad'));
    if (!snap.exists()) return Response.json({ players: [], budgetItems: [] });
    return Response.json(snap.data());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = getDb();
    await setDoc(doc(db, 'fvwl', 'squad'), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
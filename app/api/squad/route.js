import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export async function GET() {
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, 'fvwl', 'squad'));
    console.log('Snap exists:', snap.exists(), 'Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    if (!snap.exists()) return Response.json({ players: [], budgetItems: [] });
    const data = snap.data();
    console.log('Players count:', data.players?.length);
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('Error:', err.message, err.code);
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
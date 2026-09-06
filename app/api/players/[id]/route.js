import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const ftConfig = {
  apiKey: process.env.FOOTBALL_TRACKER_API_KEY,
  authDomain: process.env.FOOTBALL_TRACKER_AUTH_DOMAIN,
  projectId: process.env.FOOTBALL_TRACKER_PROJECT_ID,
  storageBucket: process.env.FOOTBALL_TRACKER_STORAGE_BUCKET,
  messagingSenderId: process.env.FOOTBALL_TRACKER_MESSAGING_SENDER_ID,
  appId: process.env.FOOTBALL_TRACKER_APP_ID,
};

function getFtDb() {
  const app = getApps().find(a => a.name === 'football-tracker')
    || initializeApp(ftConfig, 'football-tracker');
  return getFirestore(app);
}

const BOLTON_FD_ID = 60;
const SEASON = 2026;

export async function GET(request, { params }) {
  const { id } = await params;
  const highlightlyId = parseInt(id);
  try {
    const db = getFtDb();
    const snap = await getDoc(doc(db, 'player_stats', `raw_${BOLTON_FD_ID}_${SEASON}`));
    if (!snap.exists()) return Response.json(null);
    const data = snap.data();
    const player = Object.values(data.playerStats || {}).find(p => p.id === highlightlyId);
    if (!player) return Response.json(null);
    return Response.json({
      appearances: (player.starts || 0) + (player.subApps || 0),
      starts: player.starts || 0,
      subApps: player.subApps || 0,
      minutesPlayed: player.minutesPlayed || 0,
      goals: player.goals || 0,
      assists: player.assists || 0,
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
      xg: player.xg || 0,
      passes: player.passes || 0,
      tackles: player.tackles || 0,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
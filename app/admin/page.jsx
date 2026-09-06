'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Nav from '@/components/Nav';

const POSITIONS = [
  '', 'Goalkeeper', 'Central defender', 'Defender',
  'Defensive midfielder', 'Midfielder', 'Attacking midfielder',
  'Winger', 'Forward',
];

const STATUSES = ['squad', 'loan-in', 'loan-out', 'left'];

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/squad')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  function updatePlayer(idx, field, value) {
    setData(prev => {
      const players = [...prev.players];
      players[idx] = { ...players[idx], [field]: value };
      return { ...prev, players };
    });
  }

  async function saveAll() {
    setSaving(true);
    try {
      await fetch('/api/squad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      alert('All changes saved!');
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <Nav />
      <div className="page">
        <h1 className="page-title">Admin — Player Details</h1>
        <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
          Edit player positions, Highlightly IDs and status.
        </p>
        {loading && <p className="text-muted">Loading…</p>}
        {data && (
          <>
            <div className="admin-section">
              <div className="admin-section-header">Squad Players ({data.players?.length})</div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Highlightly ID</th>
                    <th>Contract end</th>
                  </tr>
                </thead>
                <tbody>
                  {data.players?.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{p.forename} {p.surname}</td>
                      <td>
                        <select className="admin-select" value={p.position || ''} onChange={e => updatePlayer(i, 'position', e.target.value)}>
                          {POSITIONS.map(pos => <option key={pos} value={pos}>{pos || '— select —'}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="admin-select" value={p.status} onChange={e => updatePlayer(i, 'status', e.target.value)}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <input className="admin-input" style={{ width: '130px' }} type="number"
                          value={p.highlightlyId || ''}
                          placeholder="e.g. 3251388"
                          onChange={e => updatePlayer(i, 'highlightlyId', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </td>
                      <td>
                        <input className="admin-input" style={{ width: '110px' }} type="text"
                          value={p.contractEnd || ''}
                          placeholder="YYYY-MM-DD"
                          onChange={e => updatePlayer(i, 'contractEnd', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button className="save-btn" style={{ padding: '0.6rem 1.5rem' }} onClick={saveAll} disabled={saving}>
                {saving ? 'Saving…' : 'Save all changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
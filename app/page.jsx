'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Nav from '@/components/Nav';

const fmtK = v => v ? `£${Math.round(v / 1000)}k` : '—';
const fmtWeekly = v => v ? `£${Math.round(v).toLocaleString()}` : '—';

const FILTERS = [
  { key: 'squad+loan-in', label: 'Playing' },
  { key: 'squad', label: 'Squad' },
  { key: 'loan-in', label: 'Loan in' },
  { key: 'loan-out', label: 'Loan out' },
  { key: 'all', label: 'All' },
];

const STATUS_LABELS = {
  squad: 'Squad',
  'loan-in': 'Loan in',
  'loan-out': 'Loan out',
  left: 'Left',
};

const STATUS_CLASS = {
  squad: 'badge-squad',
  'loan-in': 'badge-loan-in',
  'loan-out': 'badge-loan-out',
  left: 'badge-left',
};

const GROUP_LABELS = {
  squad: 'Squad',
  'loan-in': 'Loan in',
  'loan-out': 'Loan out',
  left: 'Left',
};

const GROUP_ORDER = ['squad', 'loan-in', 'loan-out', 'left'];

function isExpiringSoon(contractEnd) {
  if (!contractEnd) return false;
  const end = new Date(contractEnd);
  const now = new Date();
  const months = (end - now) / (1000 * 60 * 60 * 24 * 30);
  return months < 10;
}

function calcTotals(players) {
  return players.reduce((acc, p) => ({
    weeklyWage: acc.weeklyWage + (p.weeklyWage || 0),
    overallTotal: acc.overallTotal + (p.overallTotal || 0),
    loanIncome: acc.loanIncome + (p.loanIncome || 0),
    playerCost: acc.playerCost + (p.playerCost || 0),
  }), { weeklyWage: 0, overallTotal: 0, loanIncome: 0, playerCost: 0 });
}

export default function SquadPage() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('squad+loan-in');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerStats, setPlayerStats] = useState({});

  useEffect(() => {
    fetch('/api/squad')
      .then(r => r.json())
      .then(async d => {
        setData(d);
        setLoading(false);
        // Load stats for all players with Highlightly IDs
        const statsMap = {};
        await Promise.all(
          (d.players || [])
            .filter(p => p.highlightlyId)
            .map(async p => {
              try {
                const res = await fetch(`/api/players/${p.highlightlyId}`);
                const s = await res.json();
                if (s) statsMap[p.highlightlyId] = s;
              } catch {}
            })
        );
        setPlayerStats(statsMap);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filteredPlayers = (data?.players || []).filter(p => {
    if (filter === 'all') return true;
    if (filter === 'squad+loan-in') return p.status === 'squad' || p.status === 'loan-in';
    return p.status === filter;
  });

  const totals = calcTotals(filteredPlayers);
  const budgetTotal = (data?.budgetItems || []).reduce((s, b) => s + (b.overallTotal || 0), 0);
  const grandTotal = totals.overallTotal + budgetTotal;

  // Group players by status
  const groups = GROUP_ORDER.reduce((acc, status) => {
    const group = filteredPlayers.filter(p => p.status === status);
    if (group.length > 0) acc[status] = group.sort((a, b) => (b.overallTotal || 0) - (a.overallTotal || 0));
    return acc;
  }, {});

  return (
    <AuthGuard>
      <Nav />
      <div className="page" style={{ maxWidth: '720px' }}>
        {loading && <p className="text-muted">Loading squad data…</p>}
        {error && <p className="text-red">Error: {error}</p>}
        {data && (
          <>
            {/* Summary cards */}
            <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '1rem' }}>
              <div className="summary-card">
                <div className="summary-card-label">Weekly wage bill</div>
                <div className="summary-card-value">£{Math.round(totals.weeklyWage).toLocaleString()}</div>
                <div className="summary-card-sub">{filteredPlayers.length} players</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Annual squad cost</div>
                <div className="summary-card-value">{fmtK(totals.overallTotal)}</div>
                <div className="summary-card-sub">All-in · {fmtK(grandTotal)} inc. provisions</div>
              </div>
              {totals.loanIncome > 0 && (
                <div className="summary-card">
                  <div className="summary-card-label">Loan income</div>
                  <div className="summary-card-value" style={{ color: 'var(--green)' }}>{fmtK(totals.loanIncome)}</div>
                  <div className="summary-card-sub">Net saving from loans</div>
                </div>
              )}
              <div className="summary-card">
                <div className="summary-card-label">Net player cost</div>
                <div className="summary-card-value">{fmtK(totals.playerCost)}</div>
                <div className="summary-card-sub">After loan income</div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Player cards grouped by status */}
            {Object.entries(groups).map(([status, players]) => (
              <div key={status}>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '0.75rem 0 0.4rem',
                }}>
                  {GROUP_LABELS[status]} · {players.length}
                </div>

                {players.map((p, i) => {
                  const stats = p.highlightlyId ? playerStats[p.highlightlyId] : null;
                  const expiring = isExpiringSoon(p.contractEnd);

                  return (
                    <Link
                      key={i}
                      href={`/player/${encodeURIComponent(p.surname)}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="player-card">
                        <div className="player-card-top">
                          <div>
                            <div className="player-card-name">
                              {p.forename} {p.surname}
                            </div>
                            <div className="player-card-meta">
                              {p.position || 'Position TBC'}
                              {p.status === 'loan-in' || p.status === 'loan-out' ? ' · Season loan' : ''}
                            </div>
                          </div>
                          <span className={`badge ${STATUS_CLASS[p.status]}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </div>

                        <div className="player-card-stats">
                          <div className="player-stat">
                            <div className="player-stat-label">Weekly wage</div>
                            <div className="player-stat-value">{fmtWeekly(p.weeklyWage)}</div>
                          </div>
                          <div className="player-stat">
                            <div className="player-stat-label">Annual cost</div>
                            <div className="player-stat-value">{fmtK(p.overallTotal)}</div>
                          </div>
                          <div className="player-stat">
                            <div className="player-stat-label">Goals / Apps</div>
                            <div className="player-stat-value">
                              {stats ? `${stats.goals} / ${stats.appearances}` : '— / —'}
                            </div>
                          </div>
                        </div>

                        <div className="player-card-footer">
                          <div style={{ fontSize: '0.72rem', color: expiring ? 'var(--amber)' : 'var(--muted)' }}>
                            {p.contractEnd
                              ? `${expiring ? '⚠ ' : ''}Contract to ${p.contractEnd.substring(0, 7)}`
                              : p.status === 'loan-in' ? 'Season loan' : '—'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--navy-mid)' }}>View details →</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}

            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '1rem' }}>
              Figures rounded to nearest £000 · Last updated: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-GB') : '—'}
            </p>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
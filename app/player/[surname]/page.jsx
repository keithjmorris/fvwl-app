'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Nav from '@/components/Nav';

const fmt = v => v ? `£${Math.round(v).toLocaleString()}` : '—';
const fmtK = v => v ? `£${Math.round(v / 1000)}k` : '—';

export default function PlayerPage() {
  const { surname } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const squadRes = await fetch('/api/squad');
      const squadData = await squadRes.json();
      const p = squadData.players?.find(
        pl => pl.surname.toLowerCase() === decodeURIComponent(surname).toLowerCase()
      );
      setPlayer(p);
      if (p?.highlightlyId) {
        try {
          const statsRes = await fetch(`/api/players/${p.highlightlyId}`);
          const statsData = await statsRes.json();
          setStats(statsData);
        } catch {}
      }
      setLoading(false);
    }
    load();
  }, [surname]);

  if (loading) return <AuthGuard><Nav /><div className="page"><p className="text-muted">Loading…</p></div></AuthGuard>;
  if (!player) return <AuthGuard><Nav /><div className="page"><p>Player not found.</p></div></AuthGuard>;

  const costPerApp = stats?.appearances > 0 ? Math.round(player.playerCost / stats.appearances) : null;
  const costPerGoal = stats?.goals > 0 ? Math.round(player.playerCost / stats.goals) : null;
  const costPer90 = stats?.minutesPlayed > 0 ? Math.round(player.playerCost / (stats.minutesPlayed / 90)) : null;

  return (
    <AuthGuard>
      <Nav />
      <div className="page">
        <Link href="/" className="back-link">← Back to squad</Link>
        <div className="player-detail-header">
          <div>
            <div className="player-detail-name">{player.forename} {player.surname}</div>
            <div className="player-detail-meta">
              {player.position || 'Position TBC'} · <span style={{ textTransform: 'capitalize' }}>{player.status}</span> · Contract to {player.contractEnd ? player.contractEnd.substring(0, 7) : 'TBC'}
            </div>
            {player.salaryIncreases && (
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', maxWidth: '600px' }}>
                📈 {player.salaryIncreases}
              </div>
            )}
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>£{player.weeklyWage?.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>per week</div>
          </div>
        </div>

<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>          <div className="detail-card">
            <div className="detail-card-title">Wage & Contract Costs</div>
            <div className="detail-row"><span className="detail-row-label">Annual wage</span><span className="detail-row-value">{fmt(player.annualWage)}</span></div>
            <div className="detail-row"><span className="detail-row-label">National Insurance</span><span className="detail-row-value">{fmt(player.ni)}</span></div>
            <div className="detail-row"><span className="detail-row-label">Annual total</span><span className="detail-row-value">{fmt(player.annualTotal)}</span></div>
            {player.loyaltyBonus > 0 && <div className="detail-row"><span className="detail-row-label">Loyalty bonus</span><span className="detail-row-value">{fmt(player.loyaltyBonus)}</span></div>}
            {player.signingOnFee > 0 && <div className="detail-row"><span className="detail-row-label">Signing-on fee</span><span className="detail-row-value">{fmt(player.signingOnFee)}</span></div>}
            {player.relocation > 0 && <div className="detail-row"><span className="detail-row-label">Relocation</span><span className="detail-row-value">{fmt(player.relocation)}</span></div>}
            <div className="detail-row detail-row-total"><span>Overall total</span><span>{fmt(player.overallTotal)}</span></div>
          </div>

          <div className="detail-card">
            <div className="detail-card-title">Agent Fees</div>
            <div className="detail-row"><span className="detail-row-label">Player fees (inc. VAT)</span><span className="detail-row-value">{fmt(player.agentFeesPlayerVAT)}</span></div>
            <div className="detail-row"><span className="detail-row-label">Player NICs</span><span className="detail-row-value">{fmt(player.agentFeesPlayerNICs)}</span></div>
            <div className="detail-row"><span className="detail-row-label">Club fee (net)</span><span className="detail-row-value">{fmt(player.agentFeesClub)}</span></div>
            <div className="detail-row detail-row-total"><span>Total agent cost</span><span>{fmt((player.agentFeesPlayerVAT||0)+(player.agentFeesPlayerNICs||0)+(player.agentFeesClub||0))}</span></div>
            {player.status === 'loan-out' && <>
              <div className="detail-card-title" style={{ marginTop: '1.25rem' }}>Loan Details</div>
              <div className="detail-row"><span className="detail-row-label">Loan income</span><span className="detail-row-value text-green">{fmt(player.loanIncome)}</span></div>
              <div className="detail-row"><span className="detail-row-label">Salary saving</span><span className="detail-row-value text-green">{fmt(player.salarySaving)}</span></div>
              <div className="detail-row detail-row-total"><span>Net player cost</span><span>{fmt(player.playerCost)}</span></div>
            </>}
          </div>
        </div>

        {stats && (
          <div className="detail-card" style={{ marginBottom: '1rem' }}>
            <div className="detail-card-title">2026/27 Season Performance</div>
            <div className="perf-grid">
              {[
                { label: 'Appearances', value: stats.appearances || 0 },
                { label: 'Starts', value: stats.starts || 0 },
                { label: "Minutes", value: `${stats.minutesPlayed || 0}'` },
                { label: 'Goals', value: stats.goals || 0 },
                { label: 'Assists', value: stats.assists || 0 },
                { label: 'xG', value: stats.xg ? stats.xg.toFixed(2) : '—' },
                { label: 'Yellow', value: stats.yellowCards || 0 },
                { label: 'Red', value: stats.redCards || 0 },
              ].map(s => (
                <div key={s.label} className="perf-stat">
                  <div className="perf-stat-value">{s.value}</div>
                  <div className="perf-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(costPerApp || costPerGoal || costPer90) && (
          <div className="detail-card">
            <div className="detail-card-title">Cost vs Performance</div>
            <div className="perf-grid">
              {costPerApp && <div className="perf-stat"><div className="perf-stat-value">{fmtK(costPerApp)}</div><div className="perf-stat-label">Cost per app</div></div>}
              {costPer90 && <div className="perf-stat"><div className="perf-stat-value">{fmtK(costPer90)}</div><div className="perf-stat-label">Cost per 90'</div></div>}
              {costPerGoal && <div className="perf-stat"><div className="perf-stat-value">{fmtK(costPerGoal)}</div><div className="perf-stat-label">Cost per goal</div></div>}
            </div>
          </div>
        )}

        {!stats && !player.highlightlyId && (
          <div style={{ background: 'var(--silver)', borderRadius: 'var(--radius)', padding: '1rem', color: 'var(--muted)', fontSize: '0.82rem' }}>
            No Highlightly ID set — match stats unavailable. Add via <Link href="/admin" style={{ color: 'var(--navy-mid)' }}>Admin</Link>.
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
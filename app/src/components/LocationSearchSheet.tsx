import { useEffect, useRef, useState } from 'react';
import type { Field } from '../types';
import { FIELD_META } from '../data/fieldMeta';
import { isPrefectureLevel, searchCitiesInPrefecture, searchPlacesAugmented, type GeocodeResult } from '../lib/geocode';

const KIND_ORDER: Field[] = ['sea', 'lake', 'river'];

export function LocationSearchSheet({ onPick, onClose }: { onPick: (r: GeocodeResult, kind: Field) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [drillFrom, setDrillFrom] = useState<GeocodeResult | null>(null);
  const [cities, setCities] = useState<GeocodeResult[]>([]);
  const [cityStatus, setCityStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [pending, setPending] = useState<GeocodeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!drillFrom && !pending) inputRef.current?.focus();
  }, [drillFrom, pending]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // Clearing the box clears any stale results/status from a previous query.
      // eslint-disable-next-line react/set-state-in-effect
      setResults([]);
      // eslint-disable-next-line react/set-state-in-effect
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setStatus('loading');
      searchPlacesAugmented(q, controller.signal)
        .then((r) => {
          setResults(r);
          setStatus('idle');
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          setResults([]);
          setStatus('error');
          // eslint-disable-next-line no-console
          console.warn('[shiomi] place search failed:', err);
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!drillFrom) return;
    const controller = new AbortController();
    // eslint-disable-next-line react/set-state-in-effect
    setCityStatus('loading');
    searchCitiesInPrefecture(drillFrom.name, controller.signal)
      .then((r) => {
        setCities(r);
        setCityStatus('idle');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setCities([]);
        setCityStatus('error');
        // eslint-disable-next-line no-console
        console.warn('[shiomi] prefecture drill-down failed:', err);
      });
    return () => controller.abort();
  }, [drillFrom]);

  const handleResultTap = (r: GeocodeResult) => {
    if (isPrefectureLevel(r)) {
      setDrillFrom(r);
      return;
    }
    setPending(r);
  };

  if (pending) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(4,10,12,.66)', animation: 'fadeIn .18s ease-out' }} />
        <div
          style={{
            position: 'relative', borderRadius: '26px 26px 0 0', background: '#FFFBF4', borderTop: '1px solid rgba(43,32,22,.18)',
            padding: '12px 20px calc(20px + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 12,
            animation: 'sheetUp .26s cubic-bezier(.2,.9,.25,1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 44, height: 4, borderRadius: 99, background: 'rgba(43,32,22,.22)' }} />
          </div>
          <button onClick={() => setPending(null)} style={{ alignSelf: 'flex-start', cursor: 'pointer', font: "500 12px/1 'Zen Kaku Gothic New',sans-serif", color: 'var(--amber)', padding: '2px 0' }}>
            ← 戻る
          </button>
          <div style={{ font: "900 20px/1.2 'Zen Kaku Gothic New',sans-serif", color: '#2B2016' }}>{pending.name}</div>
          <div style={{ font: "400 11px/1.5 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.45)' }}>この地点は？（海・湖・川のどれで釣りますか）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {KIND_ORDER.map((k) => (
              <button
                key={k}
                onClick={() => onPick(pending, k)}
                style={{
                  textAlign: 'left', borderRadius: 12, background: '#FFFBF4', border: '1px solid rgba(43,32,22,.14)', padding: '13px 15px',
                  font: "700 14px/1 'Zen Kaku Gothic New',sans-serif", color: '#2B2016', cursor: 'pointer',
                }}
              >
                {FIELD_META[k].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(4,10,12,.66)', animation: 'fadeIn .18s ease-out' }} />
      <div
        style={{
          position: 'relative', borderRadius: '26px 26px 0 0', background: '#FFFBF4', borderTop: '1px solid rgba(43,32,22,.18)',
          padding: '12px 20px calc(20px + env(safe-area-inset-bottom, 0px))', maxHeight: '80%', display: 'flex', flexDirection: 'column', gap: 12,
          animation: 'sheetUp .26s cubic-bezier(.2,.9,.25,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 4, borderRadius: 99, background: 'rgba(43,32,22,.22)' }} />
        </div>

        {drillFrom ? (
          <>
            <button onClick={() => setDrillFrom(null)} style={{ alignSelf: 'flex-start', cursor: 'pointer', font: "500 12px/1 'Zen Kaku Gothic New',sans-serif", color: 'var(--amber)', padding: '2px 0' }}>
              ← 検索に戻る
            </button>
            <div style={{ font: "900 20px/1.2 'Zen Kaku Gothic New',sans-serif", color: '#2B2016' }}>{drillFrom.name}の候補地</div>
            <div style={{ font: "400 11px/1.5 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.45)' }}>県内の主な市区町村から選べます</div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 40 }}>
              {cityStatus === 'loading' && <div style={{ font: "400 12px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.4)', padding: '10px 2px' }}>読み込み中…</div>}
              {cityStatus === 'error' && (
                <div style={{ font: "400 12px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'var(--danger)', padding: '10px 2px' }}>
                  候補地の取得に失敗しました。通信環境をご確認ください。
                </div>
              )}
              {cityStatus === 'idle' &&
                cities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setPending(c)}
                    style={{
                      textAlign: 'left', borderRadius: 12, background: '#FFFBF4', border: '1px solid rgba(43,32,22,.12)', padding: '11px 13px',
                      display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer',
                    }}
                  >
                    <div style={{ font: "700 14px/1.3 'Zen Kaku Gothic New',sans-serif", color: '#2B2016' }}>{c.name}</div>
                    <div style={{ font: "400 11px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.45)' }}>{[c.admin1, c.admin2].filter(Boolean).join(' ・ ')}</div>
                  </button>
                ))}
              <button
                onClick={() => setPending(drillFrom)}
                style={{
                  textAlign: 'left', borderRadius: 12, background: 'rgba(43,32,22,.05)', border: '1px dashed rgba(43,32,22,.2)', padding: '11px 13px',
                  font: "500 12.5px/1.4 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.55)', cursor: 'pointer', marginTop: 4,
                }}
              >
                特定の市区町村ではなく、{drillFrom.name}全体のおおよその地点を使う
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ font: "900 20px/1.2 'Zen Kaku Gothic New',sans-serif", color: '#2B2016' }}>地点を検索</div>
            <div style={{ font: "400 11px/1.5 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.45)' }}>
              都道府県・市区町村・地名で検索できます（例: 札幌市、横浜、京都府）
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例: 大阪市、鎌倉、北海道"
              style={{
                width: '100%', boxSizing: 'border-box', borderRadius: 12, border: '1px solid rgba(43,32,22,.2)', background: 'rgba(43,32,22,.06)',
                color: '#2B2016', padding: '12px 14px', font: "500 15px/1 'Zen Kaku Gothic New',sans-serif", outline: 'none',
              }}
            />
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 40 }}>
              {status === 'loading' && (
                <div style={{ font: "400 12px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.4)', padding: '10px 2px' }}>検索中…</div>
              )}
              {status === 'error' && (
                <div style={{ font: "400 12px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'var(--danger)', padding: '10px 2px' }}>
                  検索に失敗しました。通信環境をご確認のうえ、もう一度お試しください。
                </div>
              )}
              {status === 'idle' && query.trim() && results.length === 0 && (
                <div style={{ font: "400 12px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.4)', padding: '10px 2px' }}>該当する地点が見つかりません。</div>
              )}
              {results.map((r) => {
                const isPref = isPrefectureLevel(r);
                return (
                  <button
                    key={r.id}
                    onClick={() => handleResultTap(r)}
                    style={{
                      textAlign: 'left', borderRadius: 12, background: '#FFFBF4', border: '1px solid rgba(43,32,22,.12)', padding: '11px 13px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <div style={{ font: "700 14px/1.3 'Zen Kaku Gothic New',sans-serif", color: '#2B2016' }}>{r.name}</div>
                      <div style={{ font: "400 11px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.45)' }}>
                        {isPref ? '都道府県 ・ タップで候補地を表示' : [r.admin1, r.admin2].filter(Boolean).join(' ・ ') || `${r.lat.toFixed(2)}N ${r.lon.toFixed(2)}E`}
                      </div>
                    </div>
                    {isPref && <div style={{ font: "400 14px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.35)', flex: 'none' }}>›</div>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div onClick={onClose} style={{ cursor: 'pointer', borderRadius: 14, background: 'rgba(43,32,22,.06)', border: '1px solid rgba(43,32,22,.14)', padding: 13, textAlign: 'center', font: "700 13px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.7)' }}>
          キャンセル
        </div>
      </div>
    </div>
  );
}

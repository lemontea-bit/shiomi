import type { CSSProperties } from 'react';
import type { WxKind } from '../types';

// Ported 1:1 from the prototype's WxIcon.dc.html (percentage-positioned circles/pills —
// no image assets, so it stays crisp at any size and needs no network fetch).
export function WxIcon({ kind, size = 24 }: { kind: WxKind; size?: number }) {
  const box: CSSProperties = { position: 'relative', width: size, height: size, flex: 'none' };
  const sun = (
    <div
      style={{
        position: 'absolute', left: '16%', top: '16%', width: '68%', height: '68%', borderRadius: '50%',
        background: 'radial-gradient(circle at 34% 30%,#FFD9A0,#E9A85F 70%)', boxShadow: '0 0 10px rgba(233,168,95,.45)',
      }}
    />
  );
  const smallSun = (
    <div
      style={{
        position: 'absolute', left: '44%', top: '4%', width: '46%', height: '46%', borderRadius: '50%',
        background: 'radial-gradient(circle at 34% 30%,#FFD9A0,#E9A85F 70%)', boxShadow: '0 0 8px rgba(233,168,95,.4)',
      }}
    />
  );
  if (kind === 'sun') return <div style={box}>{sun}</div>;
  if (kind === 'pcloud')
    return (
      <div style={box}>
        {smallSun}
        <div style={{ position: 'absolute', left: '2%', top: '50%', width: '44%', height: '44%', borderRadius: '50%', background: '#8FAAB6' }} />
        <div style={{ position: 'absolute', left: '24%', top: '34%', width: '48%', height: '48%', borderRadius: '50%', background: '#B6CCD6' }} />
        <div style={{ position: 'absolute', left: '4%', top: '66%', width: '78%', height: '24%', borderRadius: 99, background: '#A2BAC4' }} />
      </div>
    );
  if (kind === 'cloud')
    return (
      <div style={box}>
        <div style={{ position: 'absolute', left: '2%', top: '40%', width: '44%', height: '44%', borderRadius: '50%', background: '#8FAAB6' }} />
        <div style={{ position: 'absolute', left: '26%', top: '20%', width: '52%', height: '52%', borderRadius: '50%', background: '#B6CCD6' }} />
        <div style={{ position: 'absolute', left: '54%', top: '40%', width: '40%', height: '40%', borderRadius: '50%', background: '#93AEBA' }} />
        <div style={{ position: 'absolute', left: '4%', top: '58%', width: '90%', height: '26%', borderRadius: 99, background: '#A2BAC4' }} />
      </div>
    );
  if (kind === 'rain')
    return (
      <div style={box}>
        <div style={{ position: 'absolute', left: '2%', top: '22%', width: '42%', height: '42%', borderRadius: '50%', background: '#7A94A0' }} />
        <div style={{ position: 'absolute', left: '26%', top: '4%', width: '50%', height: '50%', borderRadius: '50%', background: '#9FB6C0' }} />
        <div style={{ position: 'absolute', left: '4%', top: '40%', width: '90%', height: '24%', borderRadius: 99, background: '#8CA5B0' }} />
        <div style={{ position: 'absolute', left: '22%', top: '70%', width: '7%', height: '26%', borderRadius: 99, background: '#6FA8D6' }} />
        <div style={{ position: 'absolute', left: '46%', top: '74%', width: '7%', height: '26%', borderRadius: 99, background: '#6FA8D6' }} />
        <div style={{ position: 'absolute', left: '70%', top: '70%', width: '7%', height: '26%', borderRadius: 99, background: '#6FA8D6' }} />
      </div>
    );
  return (
    <div style={box}>
      <div style={{ position: 'absolute', left: '2%', top: '18%', width: '42%', height: '42%', borderRadius: '50%', background: '#5F7683' }} />
      <div style={{ position: 'absolute', left: '26%', top: '2%', width: '50%', height: '50%', borderRadius: '50%', background: '#7E96A3' }} />
      <div style={{ position: 'absolute', left: '4%', top: '36%', width: '90%', height: '24%', borderRadius: 99, background: '#6C8492' }} />
      <div style={{ position: 'absolute', left: '40%', top: '62%', width: '24%', height: '24%', background: '#E9A85F', transform: 'rotate(45deg)' }} />
      <div style={{ position: 'absolute', left: '20%', top: '76%', width: '7%', height: '22%', borderRadius: 99, background: '#6FA8D6' }} />
      <div style={{ position: 'absolute', left: '72%', top: '76%', width: '7%', height: '22%', borderRadius: 99, background: '#6FA8D6' }} />
    </div>
  );
}

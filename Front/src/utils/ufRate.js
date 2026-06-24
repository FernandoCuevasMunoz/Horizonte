import { useState, useEffect } from 'react';

const CACHE_KEY = 'horizonte_uf_rate';
const CACHE_TTL = 4 * 60 * 60 * 1000;

let cachedRate = null;
let fetchPromise = null;

function getFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { value, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL) {
        cachedRate = value;
        return value;
      }
    }
  } catch {}
  return null;
}

function setCache(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {}
  cachedRate = value;
}

async function fetchUFRate() {
  const cached = getFromCache();
  if (cached) return cached;

  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('https://mindicador.cl/api/uf')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch UF rate');
      return res.json();
    })
    .then((data) => {
      const rate = data.serie?.[0]?.valor;
      if (!rate) throw new Error('Invalid UF response');
      const rounded = Math.round(rate);
      setCache(rounded);
      return rounded;
    })
    .catch(() => {
      const fallback = 40804;
      setCache(fallback);
      return fallback;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

let initialRate = getFromCache() || null;

export function getUFRate() {
  return initialRate;
}

export function useUFRate() {
  const [rate, setRate] = useState(initialRate);

  useEffect(() => {
    if (rate) return;

    fetchUFRate().then((v) => {
      initialRate = v;
      setRate(v);
    });
  }, [rate]);

  return rate;
}

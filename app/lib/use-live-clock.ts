"use client";

import { useEffect, useState } from "react";

type ClockListener = () => void;

type ClockBucket = {
  now: Date;
  listeners: Set<ClockListener>;
  timer: number | null;
};

const buckets = new Map<number, ClockBucket>();

function getBucket(intervalMs: number): ClockBucket {
  let bucket = buckets.get(intervalMs);
  if (!bucket) {
    bucket = { now: new Date(), listeners: new Set(), timer: null };
    buckets.set(intervalMs, bucket);
  }
  return bucket;
}

function ensureTimer(intervalMs: number) {
  const bucket = getBucket(intervalMs);
  if (bucket.timer !== null) return;

  bucket.timer = window.setInterval(() => {
    bucket.now = new Date();
    for (const listener of bucket.listeners) listener();
  }, intervalMs);
}

function maybeStopTimer(intervalMs: number) {
  const bucket = getBucket(intervalMs);
  if (bucket.listeners.size > 0 || bucket.timer === null) return;
  window.clearInterval(bucket.timer);
  bucket.timer = null;
}

/** Reloj compartido: un solo intervalo por cadencia para toda la app. */
export function useLiveClock(intervalMs = 60_000): Date {
  const bucket = getBucket(intervalMs);
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    bucket.listeners.add(listener);
    ensureTimer(intervalMs);
    return () => {
      bucket.listeners.delete(listener);
      maybeStopTimer(intervalMs);
    };
  }, [intervalMs]);

  return bucket.now;
}

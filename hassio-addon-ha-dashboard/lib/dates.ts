export function relativeTimeShort(time: Date) {
  const delta = Math.round((Date.now() - time.getTime()) / 1000);

  const M = 60;
  const H = M * 60;
  const D = H * 24;

  if (delta < M) {
    return `${delta}s`;
  } else if (delta < H) {
    return `${Math.floor(delta / M)}m`;
  } else if (delta < D) {
    return `${Math.floor(delta / H)}h`;
  } else {
    return `${Math.floor(delta / D)}d`;
  }
}

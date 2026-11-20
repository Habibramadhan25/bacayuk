export const BOOK_COVER_FALLBACK =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e7dcc4"/>
          <stop offset="100%" stop-color="#cdbb98"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="32" y="32" width="336" height="536" rx="20" fill="#f9f6f0" stroke="#bfa97a" stroke-width="4"/>
      <g fill="#8a6d1c" font-family="Arial, sans-serif" text-anchor="middle">
        <text x="200" y="280" font-size="88">&#128218;</text>
        <text x="200" y="360" font-size="28" font-weight="700">Cover tidak tersedia</text>
      </g>
    </svg>`
  );

export const USER_AVATAR_FALLBACK =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="100%" height="100%" rx="64" fill="#d9c7a8"/>
      <circle cx="64" cy="50" r="22" fill="#8a6d1c"/>
      <rect x="28" y="78" width="72" height="34" rx="17" fill="#8a6d1c"/>
    </svg>`
  );

function pickFirstString(...vals: any[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) return v;
  }
  return '';
}

export function resolveBookCover(item: any): string {
  const raw = pickFirstString(
    item?.coverUrl,
    item?.cover_url,
    item?.cover,
    item?.coverImage,
    item?.image,
    item?.imageUrl,
    item?.thumbnail,
    item?.bookCover,
    item?.book?.coverUrl,
    item?.book?.cover
  );
  return raw || BOOK_COVER_FALLBACK;
}

export function resolveUserAvatar(item: any): string {
  const raw =
    typeof item === 'string' && item.trim().length > 0
      ? item.trim()
      : pickFirstString(item?.avatar, item?.photo, item?.image, item?.profileImage, item?.avatarUrl);
  return raw || USER_AVATAR_FALLBACK;
}

import type { SyntheticEvent } from 'react';

export function handleBookCoverError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  img.src = BOOK_COVER_FALLBACK;
}

export function handleAvatarError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  img.src = USER_AVATAR_FALLBACK;
}

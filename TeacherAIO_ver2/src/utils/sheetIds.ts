// Obfuscate default Google Sheet IDs to reduce exposure
const parts = {
  main: [
    'MVdnbUxBZWFzTktDRG8xSlVtXzVpRHY5V3c1V1poOHJRM0VYQ2M4blNWdlE=',
  ],
  adv: [
    'MTl1S0tkQnEzYVo', 'UjNkZDJtM0JfLUprOFJDN2ZmVWRZUkMy', 'NUM0ek84ZjQ=',
  ],
};

function decodeId(arr: string[]) {
  try {
    const base64 = arr.join('').replace(/\s+/g, '');
    const decoded = atob(base64);
    // Basic sanity check: Google Sheet IDs are non-empty and alphanumeric with dashes/underscores
    if (/^[a-zA-Z0-9-_]+$/.test(decoded)) return decoded;
    return '';
  } catch {
    return '';
  }
}

export function getDefaultMainSheetId() {
  return decodeId(parts.main);
}

export function getDefaultAdvSheetId() {
  return decodeId(parts.adv);
}

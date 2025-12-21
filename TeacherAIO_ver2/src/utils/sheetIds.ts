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
    const base64 = arr.join('');
    return atob(base64);
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

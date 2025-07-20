export const prerender = false;

export async function GET({ params }) {
  const txId = params.txId;
  const gateways = [
    `https://arweave.net/${txId}`,
    `https://arweave.dev/${txId}`,
    `https://arweave.live/${txId}`,
    `https://arweave.app/${txId}`,
    `https://arweave.gateway.io/${txId}`
  ];
  for (const url of gateways) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return Response.redirect(url, 302);
      }
    } catch (e) {}
  }
  return new Response('File not found on any gateway', { status: 404 });
}
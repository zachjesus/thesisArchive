import Arweave from 'arweave';
import ArDB from 'ardb';

export const prerender = false;

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

const ArDBClass = ArDB.default ? ArDB.default : ArDB;
const ardb = new ArDBClass(arweave);

export async function GET({ params, request }) {
  try {
    const driveId = params.id;
    const url = new URL(request.url);
    const parentFolderId = url.searchParams.get('parentFolderId');

    let tags = [];
    if (driveId) tags.push({ name: 'Drive-Id', values: [driveId] });
    if (parentFolderId) tags.push({ name: 'Parent-Folder-Id', values: [parentFolderId] });

    let txs = await ardb.search('transactions').tags(tags).find();
    if (txs.length === 0) txs = await ardb.search('transactions').find();

    const results = await Promise.all(
      txs.map(async tx => {
        let metadata = null;
        try {
          const response = await fetch(`https://arweave.net/${tx.id}`);
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              metadata = await response.json();
            } else {
              metadata = await response.text();
            }
          }
        } catch (e) {
          metadata = null;
        }
        return { id: tx.id, tags: tx.tags, metadata };
      })
    );

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
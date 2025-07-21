import archiveNode from "../assets/archiveNode.json"; 

export default function Collections() {
  const collections = archiveNode.collections || []; 
  return (
    <div>
      <h2>Collections</h2>
      <ul>
        {collections.map((collection) => (
          <li key={collection.driveId}>
            <strong>{collection.collectionName}</strong>
            <p>Drive ID: {collection.driveId}</p>
            <p>Parent Folder ID: {collection.parentFolderId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
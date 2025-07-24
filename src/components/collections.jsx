import archiveNode from "../assets/archiveNode.json";

export default function Collections() {
  const archives = archiveNode.archives || [];
  return (
    <div>
      <h2>Collections</h2>
      {archives.map((archive) => (
        <div key={archive.name}>
          <h3>{archive.name}</h3>
          <ul>
            {archive.collections.map((collection) => (
              <li key={collection.driveId}>
                <strong>{collection.collectionName}</strong>
                <p>Drive ID: {collection.driveId}</p>
                <p>Parent Folder ID: {collection.parentFolderId}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
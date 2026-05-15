import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import FolderView from '../components/FolderView';
import { getFolders } from '../lib/supabase';
import { useAuth } from '../components/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loadingFolders, setLoadingFolders] = useState(true);

  useEffect(() => {
    if (!user) return;
    getFolders(user.id).then(({ data }) => {
      setFolders(data || []);
      if (data && data.length > 0) setActiveFolder(data[0]);
      setLoadingFolders(false);
    });
  }, [user?.id]);

  return (
    <div style={styles.root}>
      <Sidebar
        folders={folders}
        setFolders={setFolders}
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
        userId={user?.id}
      />
      <div style={styles.main}>
        {loadingFolders ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
          </div>
        ) : (
          <FolderView
            folder={activeFolder}
            userId={user?.id}
          />
        )}
      </div>

      <style>{`
        .folder-item:hover .folder-actions { display: flex !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  loading: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

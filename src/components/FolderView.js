import React, { useState, useEffect, useCallback } from 'react';
import LinkCard from './LinkCard';
import AddLinkModal from './AddLinkModal';
import ChatBot from './ChatBot';
import { getLinks, createLink } from '../lib/supabase';
import { formatUrl, getLinkType } from '../lib/urlUtils';

export default function FolderView({ folder, userId }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!folder) return;
    setLoading(true);
    getLinks(folder.id).then(({ data }) => {
      setLinks(data || []);
      setLoading(false);
    });
  }, [folder?.id]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const link = JSON.parse(raw);
      const formattedUrl = formatUrl(link.url);
      const type = getLinkType(formattedUrl);
      const { data } = await createLink(folder.id, userId, {
        url: formattedUrl,
        name: link.name || '',
        description: link.description || '',
        type,
      });
      if (data) setLinks(prev => [...prev, data]);
    } catch {}
  }, [folder?.id, userId]);

  const filtered = links.filter(l => {
    const matchSearch = !search || 
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.url?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.type === filter;
    return matchSearch && matchFilter;
  });

  if (!folder) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>◈</div>
        <p style={styles.emptyTitle}>Select a folder</p>
        <p style={styles.emptyDesc}>Choose or create a folder from the sidebar to get started</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Left: Links panel */}
      <div
        style={{ ...styles.linksPanel, ...(isDragOver ? styles.dragOver : {}) }}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Folder header */}
        <div style={styles.folderHeader}>
          <div style={styles.folderTitle}>
            <span style={{ ...styles.folderIcon, background: folder.color + '22', color: folder.color }}>
              {folder.icon}
            </span>
            <h2 style={styles.folderName}>{folder.name}</h2>
            <span style={styles.count}>{links.length}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={styles.addBtn}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bright)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            + Add Link
          </button>
        </div>

        {/* Search + filter */}
        <div style={styles.toolbar}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search links..."
            style={styles.searchInput}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
          />
          <div style={styles.filters}>
            {['all', 'youtube', 'link', 'video'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
              >
                {f === 'all' ? 'All' : f === 'youtube' ? '▶ YT' : f === 'video' ? '▶ Video' : '🔗 Links'}
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone hint */}
        {isDragOver && (
          <div style={styles.dropHint}>
            <span style={styles.dropHintText}>↓ Drop to add link</span>
          </div>
        )}

        {/* Links grid */}
        <div style={styles.linksScroll}>
          {loading ? (
            <div style={styles.loadingGrid}>
              {[1,2,3,4].map(i => <div key={i} style={styles.skeleton} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyLinks}>
              <div style={styles.emptyLinksIcon}>⬡</div>
              <p>{search ? 'No links match your search' : 'No links yet — add one or drag from the chatbot!'}</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map(link => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDeleted={id => setLinks(prev => prev.filter(l => l.id !== id))}
                  onUpdated={updated => setLinks(prev => prev.map(l => l.id === updated.id ? updated : l))}
                />
              ))}
            </div>
          )}

          {/* Empty drop area */}
          {!loading && filtered.length === 0 && !search && (
            <div style={styles.dropZone}>
              <span style={styles.dropZoneText}>Drop chatbot links here</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Chatbot */}
      <div style={styles.chatPanel}>
        <ChatBot folderName={folder.name} />
      </div>

      {showAddModal && (
        <AddLinkModal
          folderId={folder.id}
          userId={userId}
          onAdded={link => setLinks(prev => [...prev, link])}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
  },
  linksPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'background 0.2s',
  },
  dragOver: {
    background: 'rgba(108,99,255,0.04)',
    outline: '2px dashed var(--accent)',
    outlineOffset: '-4px',
  },
  folderHeader: {
    padding: '24px 28px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderBottom: '1px solid var(--border)',
  },
  folderTitle: { display: 'flex', alignItems: 'center', gap: '12px' },
  folderIcon: {
    width: '36px', height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  folderName: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  count: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dim)',
  },
  addBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'var(--font-display)',
  },
  toolbar: {
    padding: '12px 28px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexShrink: 0,
    borderBottom: '1px solid var(--border)',
  },
  searchInput: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border-bright)',
    borderRadius: '8px',
    padding: '8px 14px',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    transition: 'border-color 0.2s',
  },
  filters: { display: 'flex', gap: '4px' },
  filterBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '6px 12px',
    color: 'var(--text-dim)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  filterActive: {
    background: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
    color: 'var(--accent-bright)',
  },
  dropHint: {
    margin: '0 28px',
    padding: '10px',
    background: 'var(--accent-dim)',
    border: '1px dashed var(--accent)',
    borderRadius: '8px',
    textAlign: 'center',
    animation: 'fadeIn 0.2s ease',
  },
  dropHintText: { fontSize: '13px', color: 'var(--accent)', fontWeight: '600' },
  linksScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 28px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
  },
  skeleton: {
    height: '140px',
    borderRadius: 'var(--radius)',
    background: 'linear-gradient(90deg, var(--bg-card2) 25%, var(--bg-input) 50%, var(--bg-card2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  emptyLinks: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-dimmer)',
  },
  emptyLinksIcon: {
    fontSize: '40px',
    color: 'var(--border-bright)',
    marginBottom: '12px',
  },
  dropZone: {
    marginTop: '20px',
    border: '2px dashed var(--border)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
  },
  dropZoneText: {
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dimmer)',
  },
  chatPanel: {
    width: '360px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderLeft: '1px solid var(--border)',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: 'var(--text-dimmer)',
  },
  emptyIcon: { fontSize: '60px', color: 'var(--border-bright)', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 },
};

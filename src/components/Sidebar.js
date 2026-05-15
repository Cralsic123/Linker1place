import React, { useState } from 'react';
import { createFolder, deleteFolder, updateFolder } from '../lib/supabase';
import { signOut } from '../lib/supabase';

const COLORS = [
  '#6c63ff', '#ff6584', '#43e97b', '#f7971e',
  '#4facfe', '#f953c6', '#00b09b', '#ff4e50',
  '#a18cd1', '#fccb90', '#84fab0', '#a1c4fd',
];

const ICONS = ['📁', '⚡', '🎯', '🔥', '💻', '🧠', '🎮', '📚', '🚀', '⚙️', '🎨', '🔬', '📊', '🏆', '💡', '🌐'];

export default function Sidebar({ folders, setFolders, activeFolder, setActiveFolder, userId }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { data } = await createFolder(userId, newName.trim(), selectedColor, selectedIcon);
    if (data) {
      setFolders(prev => [...prev, data]);
      setActiveFolder(data);
    }
    setNewName('');
    setCreating(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this folder and all its links?')) return;
    await deleteFolder(id);
    setFolders(prev => prev.filter(f => f.id !== id));
    if (activeFolder?.id === id) setActiveFolder(null);
  };

  const handleRename = async (id) => {
    if (!editName.trim()) return;
    const { data } = await updateFolder(id, { name: editName.trim() });
    if (data) setFolders(prev => prev.map(f => f.id === id ? data : f));
    setEditingId(null);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (collapsed) {
    return (
      <div style={styles.sidebarCollapsed}>
        <button onClick={() => setCollapsed(false)} style={styles.collapseBtn} title="Expand">›</button>
        {folders.map(f => (
          <button
            key={f.id}
            onClick={() => { setActiveFolder(f); setCollapsed(false); }}
            style={{
              ...styles.collapsedIcon,
              ...(activeFolder?.id === f.id ? styles.collapsedActive : {}),
            }}
            title={f.name}
          >
            {f.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.sidebar}>
      {/* Logo + collapse */}
      <div style={styles.logo}>
        <div style={styles.logoMark}>⬡</div>
        <span style={styles.logoText}>LinkVault</span>
        <button onClick={() => setCollapsed(true)} style={styles.collapseBtn} title="Collapse">‹</button>
      </div>

      {/* Folders list */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Folders</span>
          <button
            onClick={() => setCreating(!creating)}
            style={styles.newBtn}
            title="New folder"
          >
            +
          </button>
        </div>

        {/* Create new folder form */}
        {creating && (
          <form onSubmit={handleCreate} style={styles.createForm}>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Folder name..."
              style={styles.createInput}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
            />
            <div style={styles.colorRow}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    ...styles.colorDot,
                    background: c,
                    outline: selectedColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
            <div style={styles.iconRow}>
              {ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setSelectedIcon(ic)}
                  style={{
                    ...styles.iconBtn,
                    background: selectedIcon === ic ? 'var(--accent-dim)' : 'none',
                    borderColor: selectedIcon === ic ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
            <div style={styles.createActions}>
              <button type="submit" style={styles.createSubmit}>Create</button>
              <button type="button" onClick={() => setCreating(false)} style={styles.createCancel}>Cancel</button>
            </div>
          </form>
        )}

        {/* Folders */}
        <div style={styles.folderList}>
          {folders.length === 0 && !creating && (
            <div style={styles.noFolders}>No folders yet. Create one!</div>
          )}
          {folders.map(folder => (
            <div
              key={folder.id}
              onClick={() => setActiveFolder(folder)}
              style={{
                ...styles.folderItem,
                ...(activeFolder?.id === folder.id ? styles.folderActive : {}),
              }}
              onMouseEnter={e => {
                if (activeFolder?.id !== folder.id) {
                  e.currentTarget.style.background = 'var(--bg-input)';
                }
              }}
              onMouseLeave={e => {
                if (activeFolder?.id !== folder.id) {
                  e.currentTarget.style.background = 'none';
                }
              }}
            >
              {editingId === folder.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleRename(folder.id)}
                  onKeyDown={e => e.key === 'Enter' && handleRename(folder.id)}
                  onClick={e => e.stopPropagation()}
                  style={styles.renameInput}
                />
              ) : (
                <>
                  <span style={{ ...styles.folderItemIcon, color: folder.color }}>
                    {folder.icon}
                  </span>
                  <span style={styles.folderItemName}>{folder.name}</span>
                  <div style={styles.folderActions}>
                    <button
                      onClick={e => { e.stopPropagation(); setEditingId(folder.id); setEditName(folder.name); }}
                      style={styles.folderActionBtn}
                      title="Rename"
                    >
                      ✎
                    </button>
                    <button
                      onClick={e => handleDelete(e, folder.id)}
                      style={{ ...styles.folderActionBtn, color: 'var(--accent2)' }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: user */}
      <div style={styles.bottom}>
        <div style={styles.userRow}>
          <div style={styles.userAvatar}>
            {userId?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <span style={styles.userEmail}>My Vault</span>
          <button onClick={handleSignOut} style={styles.signOutBtn} title="Sign out">
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    flexShrink: 0,
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarCollapsed: {
    width: '52px',
    flexShrink: 0,
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 0',
    gap: '4px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 16px 16px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  logoMark: {
    fontSize: '20px',
    color: 'var(--accent)',
    lineHeight: 1,
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '800',
    flex: 1,
    letterSpacing: '-0.3px',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dimmer)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    transition: 'color 0.15s',
  },
  section: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px 8px',
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-dimmer)',
  },
  newBtn: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-bright)',
    borderRadius: '6px',
    color: 'var(--text)',
    width: '24px',
    height: '24px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
    lineHeight: 1,
  },
  createForm: {
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: 'var(--bg-card2)',
    margin: '0 8px',
    borderRadius: '10px',
    border: '1px solid var(--border-bright)',
    flexShrink: 0,
  },
  createInput: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-bright)',
    borderRadius: '6px',
    padding: '7px 10px',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
    transition: 'border-color 0.2s',
  },
  colorRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  colorDot: {
    width: '18px', height: '18px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'outline 0.1s',
    padding: 0,
  },
  iconRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3px',
  },
  iconBtn: {
    background: 'none',
    border: '1px solid transparent',
    borderRadius: '6px',
    padding: '3px',
    cursor: 'pointer',
    fontSize: '15px',
    lineHeight: 1,
    transition: 'background 0.15s',
  },
  createActions: {
    display: 'flex',
    gap: '6px',
  },
  createSubmit: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    flex: 1,
  },
  createCancel: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '6px 10px',
    color: 'var(--text-dim)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
  folderList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
  },
  noFolders: {
    padding: '20px 12px',
    fontSize: '12px',
    color: 'var(--text-dimmer)',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center',
  },
  folderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    position: 'relative',
    marginBottom: '2px',
  },
  folderActive: {
    background: 'var(--accent-dim)',
    border: '1px solid rgba(108,99,255,0.2)',
  },
  folderItemIcon: { fontSize: '16px', flexShrink: 0 },
  folderItemName: {
    flex: 1,
    fontSize: '13px',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  folderActions: {
    display: 'none',
    gap: '2px',
    position: 'absolute',
    right: '8px',
  },
  folderActionBtn: {
    background: 'var(--bg-input)',
    border: 'none',
    color: 'var(--text-dim)',
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  renameInput: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--accent)',
    borderRadius: '5px',
    padding: '4px 8px',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
  },
  collapsedIcon: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    padding: '6px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  collapsedActive: {
    background: 'var(--accent-dim)',
  },
  bottom: {
    borderTop: '1px solid var(--border)',
    padding: '12px',
    flexShrink: 0,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userAvatar: {
    width: '28px', height: '28px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--accent)',
    flexShrink: 0,
  },
  userEmail: {
    flex: 1,
    fontSize: '12px',
    color: 'var(--text-dim)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dimmer)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    transition: 'color 0.15s',
  },
};

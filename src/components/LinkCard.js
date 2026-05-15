import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { getYouTubeVideoId, getYouTubeThumbnail, getFavicon, extractDomain, getLinkType } from '../lib/urlUtils';
import { deleteLink, updateLink } from '../lib/supabase';

export default function LinkCard({ link, onDeleted, onUpdated, isDraggable = false }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(link.name || '');
  const [editDesc, setEditDesc] = useState(link.description || '');
  const [editUrl, setEditUrl] = useState(link.url || '');
  const [hovered, setHovered] = useState(false);
  const [saving, setSaving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: link.id, data: { link } });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : {};

  const type = getLinkType(link.url);
  const videoId = type === 'youtube' ? getYouTubeVideoId(link.url) : null;
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;
  const favicon = !thumbnail ? getFavicon(link.url) : null;
  const domain = extractDomain(link.url);

  const handleDelete = async () => {
    await deleteLink(link.id);
    onDeleted(link.id);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data } = await updateLink(link.id, {
      name: editName,
      description: editDesc,
      url: editUrl,
    });
    if (data) onUpdated(data);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={styles.card}>
        <div style={styles.editForm}>
          <input
            style={styles.editInput}
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder="Name"
          />
          <input
            style={styles.editInput}
            value={editUrl}
            onChange={e => setEditUrl(e.target.value)}
            placeholder="URL"
          />
          <textarea
            style={{ ...styles.editInput, resize: 'none', height: '60px' }}
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
          />
          <div style={styles.editActions}>
            <button onClick={handleSave} disabled={saving} style={styles.saveBtnSmall}>
              {saving ? '...' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} style={styles.cancelBtnSmall}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.card,
        ...(isDragging ? styles.dragging : {}),
        ...(hovered ? styles.cardHovered : {}),
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle */}
      {isDraggable && (
        <div {...listeners} {...attributes} style={styles.dragHandle} title="Drag">
          ⠿
        </div>
      )}

      {/* Thumbnail for YouTube */}
      {thumbnail && (
        <a href={link.url} target="_blank" rel="noopener noreferrer" style={styles.thumbLink}>
          <div style={styles.thumbContainer}>
            <img src={thumbnail} alt={link.name} style={styles.thumb} />
            <div style={styles.playOverlay}>▶</div>
          </div>
        </a>
      )}

      <div style={styles.body}>
        {/* Header row */}
        <div style={styles.header}>
          {favicon && <img src={favicon} alt="" style={styles.favicon} />}
          <div style={styles.typeTag(type)}>
            {type === 'youtube' ? '▶ YouTube' : type === 'video' ? '▶ Video' : '🔗 Link'}
          </div>
          {hovered && (
            <div style={styles.actions}>
              <button onClick={() => setEditing(true)} style={styles.actionBtn} title="Edit">✎</button>
              <button onClick={handleDelete} style={{ ...styles.actionBtn, color: 'var(--accent2)' }} title="Delete">✕</button>
            </div>
          )}
        </div>

        {/* Name */}
        <a href={link.url} target="_blank" rel="noopener noreferrer" style={styles.name}>
          {link.name || domain}
        </a>

        {/* Description */}
        {link.description && (
          <p style={styles.desc}>{link.description}</p>
        )}

        {/* Domain */}
        <div style={styles.domain}>{domain}</div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
    position: 'relative',
    animation: 'fadeIn 0.3s ease',
  },
  cardHovered: {
    borderColor: 'var(--border-bright)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    transform: 'translateY(-1px)',
  },
  dragging: {
    opacity: 0.4,
  },
  dragHandle: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    color: 'var(--text-dimmer)',
    cursor: 'grab',
    fontSize: '16px',
    zIndex: 1,
    userSelect: 'none',
    '&:active': { cursor: 'grabbing' },
  },
  thumbLink: { display: 'block' },
  thumbContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    overflow: 'hidden',
    background: '#000',
  },
  thumb: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.2s',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    width: '40px', height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  body: { padding: '12px' },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  favicon: { width: '16px', height: '16px', borderRadius: '3px' },
  typeTag: (type) => ({
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    padding: '2px 7px',
    borderRadius: '20px',
    background: type === 'youtube'
      ? 'rgba(255,0,0,0.12)'
      : type === 'video'
        ? 'rgba(108,99,255,0.12)'
        : 'rgba(67,233,123,0.1)',
    color: type === 'youtube'
      ? '#ff4444'
      : type === 'video'
        ? 'var(--accent)'
        : 'var(--accent3)',
    marginRight: 'auto',
  }),
  actions: {
    display: 'flex',
    gap: '4px',
    marginLeft: 'auto',
  },
  actionBtn: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    color: 'var(--text-dim)',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    padding: 0,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  name: {
    display: 'block',
    fontWeight: '600',
    fontSize: '13px',
    color: 'var(--text)',
    marginBottom: '4px',
    lineHeight: '1.4',
    transition: 'color 0.15s',
    '&:hover': { color: 'var(--accent-bright)' },
  },
  desc: {
    fontSize: '12px',
    color: 'var(--text-dim)',
    marginBottom: '6px',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  domain: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dimmer)',
  },
  editForm: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  editInput: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-bright)',
    borderRadius: '6px',
    padding: '8px 10px',
    color: 'var(--text)',
    fontSize: '13px',
    width: '100%',
    fontFamily: 'var(--font-display)',
  },
  editActions: { display: 'flex', gap: '8px' },
  saveBtnSmall: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '7px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
  cancelBtnSmall: {
    background: 'var(--bg-input)',
    color: 'var(--text-dim)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '7px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
};

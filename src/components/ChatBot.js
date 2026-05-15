import React, { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `You are a helpful learning resource assistant for LinkVault, a knowledge management app. 
When users ask for resources on topics like DSA, system design, programming, etc., you recommend:
1. YouTube video links (real, popular channels like NeetCode, Abdul Bari, Tech With Tim, Fireship, Hussein Nasser, etc.)
2. Practice websites (LeetCode, HackerRank, GeeksForGeeks, etc.)
3. Documentation sites

Format your response with clear sections. For YouTube links, always include the full YouTube URL in format: [Video Title](https://youtube.com/...). For websites, include [Site Name](https://...). 

Be concise and practical. Focus on the most valuable resources. Always include at least 3-5 specific links in your response. Make the links draggable by formatting them as: 
LINK: [name] | [url] | [description]

Include a mix of video tutorials and practice sites.`;

export default function ChatBot({ folderName, onDragLink }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey! I'm your resource assistant for **${folderName}**. Ask me for YouTube videos, practice sites, tutorials — anything to boost your learning. You can drag recommended links directly into your folder! 🎯`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractLinks = (text) => {
    const links = [];
    const linkRegex = /LINK:\s*\[([^\]]+)\]\s*\|\s*(https?:\/\/[^\s|]+)\s*\|\s*([^\n]+)/g;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      links.push({
        id: Math.random().toString(36).substr(2, 9),
        name: match[1].trim(),
        url: match[2].trim(),
        description: match[3].trim(),
      });
    }
    // Also try markdown link format as fallback
    if (links.length === 0) {
      const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
      while ((match = mdRegex.exec(text)) !== null) {
        links.push({
          id: Math.random().toString(36).substr(2, 9),
          name: match[1].trim(),
          url: match[2].trim(),
          description: '',
        });
      }
    }
    return links;
  };

  const renderMessage = (content) => {
    const links = extractLinks(content);
    
    // Clean up LINK: format lines for display
    let displayContent = content.replace(/LINK:\s*\[[^\]]+\]\s*\|[^\n]+/g, '').trim();
    
    // Convert markdown-ish formatting
    displayContent = displayContent
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent-bright);text-decoration:underline">$1</a>')
      .replace(/\n/g, '<br/>');

    return { displayContent, links };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT.replace('${folderName}', folderName),
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const assistantContent = data.content?.[0]?.text || 'Sorry, I could not get a response.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDragStart = (e, link) => {
    e.dataTransfer.setData('application/json', JSON.stringify(link));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.botDot} />
          <span style={styles.botName}>AI Assistant</span>
        </div>
        <span style={styles.headerHint}>Drag links → folder</span>
      </div>

      <div style={styles.messages}>
        {messages.map((msg, i) => {
          const { displayContent, links } = msg.role === 'assistant'
            ? renderMessage(msg.content)
            : { displayContent: msg.content, links: [] };

          return (
            <div key={i} style={msg.role === 'user' ? styles.userMsg : styles.botMsg}>
              {msg.role === 'assistant' && (
                <div style={styles.botAvatar}>⬡</div>
              )}
              <div style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                {msg.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                ) : (
                  <span>{msg.content}</span>
                )}
                
                {/* Draggable link chips */}
                {links.length > 0 && (
                  <div style={styles.linkChips}>
                    <div style={styles.chipsLabel}>↓ Drag to add to folder</div>
                    {links.map(link => (
                      <div
                        key={link.id}
                        draggable
                        onDragStart={e => handleDragStart(e, link)}
                        style={styles.linkChip}
                        title={link.url}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                      >
                        <span style={styles.chipIcon}>
                          {link.url.includes('youtube') ? '▶' : '🔗'}
                        </span>
                        <div style={styles.chipText}>
                          <span style={styles.chipName}>{link.name}</span>
                          {link.description && (
                            <span style={styles.chipDesc}>{link.description}</span>
                          )}
                        </div>
                        <span style={styles.chipDrag}>⠿</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={styles.botMsg}>
            <div style={styles.botAvatar}>⬡</div>
            <div style={styles.botBubble}>
              <div style={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <div style={styles.quickBtns}>
          {[`YouTube for ${folderName}`, 'Best practice sites', 'Beginner roadmap'].map(q => (
            <button
              key={q}
              onClick={() => setInput(q)}
              style={styles.quickBtn}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {q}
            </button>
          ))}
        </div>
        <div style={styles.inputRow}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Ask for ${folderName} resources...`}
            style={styles.textarea}
            rows={1}
            disabled={loading}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--bg-card)',
    borderLeft: '1px solid var(--border)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  botDot: {
    width: '8px', height: '8px',
    borderRadius: '50%',
    background: 'var(--accent3)',
    boxShadow: '0 0 6px var(--accent3)',
    animation: 'pulse 2s infinite',
  },
  botName: { fontWeight: '700', fontSize: '13px' },
  headerHint: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dimmer)',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userMsg: {
    display: 'flex',
    justifyContent: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  botMsg: {
    display: 'flex',
    gap: '8px',
    animation: 'fadeIn 0.2s ease',
  },
  botAvatar: {
    width: '28px', height: '28px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: 'var(--accent)',
    flexShrink: 0,
  },
  userBubble: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '12px 12px 2px 12px',
    padding: '10px 14px',
    maxWidth: '85%',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  botBubble: {
    background: 'var(--bg-card2)',
    border: '1px solid var(--border)',
    borderRadius: '2px 12px 12px 12px',
    padding: '12px 14px',
    maxWidth: '90%',
    fontSize: '13px',
    lineHeight: 1.6,
    color: 'var(--text)',
  },
  linkChips: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  chipsLabel: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
    marginBottom: '2px',
  },
  linkChip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: 'var(--bg)',
    border: '1px solid var(--border-bright)',
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'grab',
    transition: 'border-color 0.15s',
  },
  chipIcon: { fontSize: '14px', flexShrink: 0, marginTop: '1px' },
  chipText: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' },
  chipName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipDesc: {
    fontSize: '11px',
    color: 'var(--text-dimmer)',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipDrag: {
    color: 'var(--text-dimmer)',
    fontSize: '14px',
    flexShrink: 0,
  },
  typing: {
    display: 'flex',
    gap: '4px',
    '& span': {
      width: '6px', height: '6px',
      borderRadius: '50%',
      background: 'var(--text-dim)',
      animation: 'typing 1.2s infinite',
    },
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  },
  quickBtns: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  quickBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '4px 10px',
    color: 'var(--text-dim)',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'nowrap',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border-bright)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
    resize: 'none',
    lineHeight: 1.5,
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'var(--font-display)',
    transition: 'opacity 0.2s',
  },
};

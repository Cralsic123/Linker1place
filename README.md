# ⬡ LinkVault

A personal knowledge hub — store bookmarks, YouTube videos, and resources organized into folders with an AI chatbot that recommends content you can drag directly into your folders.

## ✨ Features

- **Folders (Slabs)** — Create color-coded, icon-tagged folders like `DSA`, `System Design`, `GTA5`
- **Link Cards** — Store any URL with a name and description; YouTube links auto-show thumbnails
- **AI Chatbot** — Ask for YouTube videos, practice sites, tutorials. Drag recommended links directly into your folder
- **Drag & Drop** — Drag links from chatbot panel into your folder area
- **Filter & Search** — Filter by type (YouTube / Link / Video) and full-text search
- **Auth** — Email/password via Supabase Auth

---

## 🚀 Deploy to Vercel + Supabase

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon public key** (Settings → API)
3. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → **Run**
4. Go to **Authentication → Settings** → make sure Email auth is enabled

### Step 2 — Set up Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add these **Environment Variables** in Vercel:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Click **Deploy**

That's it — your app is live!

---

## 🛠 Local Development

```bash
# 1. Clone and install
git clone <your-repo>
cd linkvault
npm install

# 2. Create .env file
cp .env.example .env
# Fill in your Supabase URL and anon key

# 3. Start dev server
npm start
```

---

## 📁 Project Structure

```
linkvault/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AuthContext.js     # Global auth state
│   │   ├── Sidebar.js         # Folder list + create/edit
│   │   ├── FolderView.js      # Main content area + drag-drop
│   │   ├── LinkCard.js        # Individual link/video card
│   │   ├── AddLinkModal.js    # Add link dialog
│   │   └── ChatBot.js         # AI assistant panel
│   ├── lib/
│   │   ├── supabase.js        # Supabase client + helpers
│   │   └── urlUtils.js        # URL/YouTube helpers
│   ├── pages/
│   │   ├── AuthPage.js        # Login/signup
│   │   └── Dashboard.js       # Main app shell
│   ├── App.js
│   ├── index.js
│   └── index.css
├── supabase-schema.sql        # Run this in Supabase SQL editor
├── vercel.json
└── .env.example
```

---

## 🔧 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 |
| Auth + DB | Supabase |
| AI Chatbot | Claude API (claude-sonnet-4) |
| Deployment | Vercel |
| Fonts | Syne + JetBrains Mono |

---

## 💡 Usage Tips

- **Create a folder** → Click `+` next to Folders in the sidebar, pick a name, color, and icon
- **Add a link** → Open a folder → click `+ Add Link` → paste any URL (YouTube, LeetCode, etc.)
- **Use the chatbot** → Type e.g. *"YouTube videos for binary search"* → drag the chips into your folder
- **Drag from chatbot** → Grab a link chip in the right panel and drop it onto the left panel
- **Filter links** → Use the All / YT / Video / Links filter buttons in the toolbar
- **Rename/delete folders** → Hover a folder in the sidebar to see edit/delete icons

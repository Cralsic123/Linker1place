import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in demo mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Auth helpers
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Folders (slabs)
export const getFolders = async (userId) => {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const createFolder = async (userId, name, color, icon) => {
  const { data, error } = await supabase
    .from('folders')
    .insert([{ user_id: userId, name, color, icon }])
    .select()
    .single();
  return { data, error };
};

export const updateFolder = async (id, updates) => {
  const { data, error } = await supabase
    .from('folders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteFolder = async (id) => {
  const { error } = await supabase.from('folders').delete().eq('id', id);
  return { error };
};

// Links/Cards
export const getLinks = async (folderId) => {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const createLink = async (folderId, userId, linkData) => {
  const { data, error } = await supabase
    .from('links')
    .insert([{ folder_id: folderId, user_id: userId, ...linkData }])
    .select()
    .single();
  return { data, error };
};

export const updateLink = async (id, updates) => {
  const { data, error } = await supabase
    .from('links')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteLink = async (id) => {
  const { error } = await supabase.from('links').delete().eq('id', id);
  return { error };
};

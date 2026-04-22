import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Home.module.css";

type Post = {
  id: number;
  title: string;
  content: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setPosts(data as Post[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !content.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("posts")
      .insert([{ title: title.trim(), content: content.trim() }]);

    if (error) {
      setFormError(error.message);
    } else {
      setTitle("");
      setContent("");
      await fetchPosts();
    }
    setSubmitting(false);
  }

  return (
    <div className={styles.page}>
      <h1>Supabase Posts</h1>

      {/* Create */}
      <h2>New Post</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
        <textarea
          className={styles.textarea}
          placeholder="Content"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
        />
        {formError && <p className={styles.error}>{formError}</p>}
        <button className={styles.btn} type="submit" disabled={submitting}>
          {submitting ? "Posting…" : "Create Post"}
        </button>
      </form>

      {/* List */}
      <h2>All Posts</h2>
      {loading && <p>Loading…</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && posts.length === 0 && <p>No posts yet.</p>}

      <div className={styles.postList}>
        {posts.map((post) => (
          <div key={post.id} className={styles.postCard}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

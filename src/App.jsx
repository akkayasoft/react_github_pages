import { useEffect, useState } from "react";
import { api } from "./api";
import "./styles.css";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Form state
  const [form, setForm] = useState({ title: "", body: "" });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm({ title: "", body: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    setSubmitting(true);
    setErr("");

    try {
      if (editingId == null) {
        // CREATE (POST)
        const created = await api.createPost(form);
        // JSONPlaceholder id'yi 101 gibi döndürebilir; liste başına ekleyelim
        setPosts((p) => [created, ...p]);
        resetForm();
      } else {
        // UPDATE (PATCH)
        const updated = await api.updatePost(editingId, form);
        setPosts((p) =>
          p.map((item) => (item.id === editingId ? { ...item, ...updated } : item))
        );
        resetForm();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({ title: post.title, body: post.body ?? "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Silinsin mi?")) return;
    setErr("");
    try {
      await api.deletePost(id);
      setPosts((p) => p.filter((x) => x.id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) return <div className="container">Yükleniyor...</div>;

  return (
    <div className="container">
      <h1>React API CRUD (Basit)</h1>

      {err && <div className="alert">{err}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-header">
          <strong>{editingId == null ? "Yeni Kayıt" : `Güncelleme (id: ${editingId})`}</strong>
          {editingId != null && (
            <button type="button" className="btn ghost" onClick={resetForm} disabled={submitting}>
              İptal
            </button>
          )}
        </div>

        <label>
          Başlık
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Örn: React CRUD"
            required
          />
        </label>

        <label>
          İçerik
          <textarea
            name="body"
            value={form.body}
            onChange={onChange}
            placeholder="Kısa açıklama..."
            rows={3}
            required
          />
        </label>

        <button className="btn" disabled={submitting}>
          {submitting ? "Gönderiliyor..." : editingId == null ? "Kaydet (POST)" : "Güncelle (PATCH)"}
        </button>
      </form>

      <ul className="list">
        {posts.map((p) => (
          <li key={p.id} className="card item">
            <div className="item-main">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
            <div className="item-actions">
              <button className="btn ghost" onClick={() => handleEdit(p)}>
                Düzenle
              </button>
              <button className="btn danger" onClick={() => handleDelete(p.id)}>
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="muted">
        Not: JSONPlaceholder deneme servisidir; değişiklikler kalıcı değildir.
      </p>
    </div>
  );
}

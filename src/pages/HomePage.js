import React, { useState, useEffect } from "react";
import logo from "../masterplast-logo.png";

const NOT_TYPES = [
  { value: "bilgi", label: "Bilgi", color: "#199cdf" },
  { value: "uyari", label: "Uyarı", color: "#f6c400" },
  { value: "kritik", label: "Kritik", color: "#ef4c3b" },
  { value: "gorev", label: "Görev", color: "#18c671" },
];

export default function HomePage() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteType, setNoteType] = useState("bilgi");
  const [editIndex, setEditIndex] = useState(-1);

  // İlk açılışta localStorage’dan notları al
  useEffect(() => {
    try {
      const localNotes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];
      setNotes(localNotes);
    } catch {
      setNotes([]);
    }
  }, []);

  // Notlar güncellenince localStorage’a yaz
  useEffect(() => {
    localStorage.setItem("dashboardNotes", JSON.stringify(notes));
  }, [notes]);

  // Not ekleme/düzenleme
  function handleSubmit(e) {
    e.preventDefault();
    if (!noteTitle.trim() && !noteDesc.trim()) return;
    const newNote = {
      title: noteTitle.trim(),
      desc: noteDesc.trim(),
      type: noteType,
      date: new Date().toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }),
    };
    if (editIndex >= 0) {
      const updated = [...notes];
      updated[editIndex] = newNote;
      setNotes(updated);
      setEditIndex(-1);
    } else {
      setNotes([newNote, ...notes]);
    }
    setNoteTitle("");
    setNoteDesc("");
    setNoteType("bilgi");
    setShowForm(false);
  }

  function handleEdit(i) {
    setEditIndex(i);
    setNoteTitle(notes[i].title);
    setNoteDesc(notes[i].desc);
    setNoteType(notes[i].type);
    setShowForm(true);
  }

  function handleDelete(i) {
    if (window.confirm("Not silinsin mi?")) {
      setNotes(notes.filter((_, idx) => idx !== i));
      setEditIndex(-1);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#f6fafd",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 0"
    }}>
      <img src={logo} alt="Masterplast Logo" style={{ width: 210, margin: "0 0 24px 0" }} />
      <div style={{
        maxWidth: 520, width: "100%", background: "#fff", borderRadius: 18,
        padding: "24px 28px 16px 28px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32
      }}>
        <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 27, marginBottom: 12 }}>
          Önemli Notlar & Hatırlatıcılar
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditIndex(-1); setNoteTitle(""); setNoteDesc(""); setNoteType("bilgi"); }}
          style={{
            background: "#199cdf", color: "#fff", border: "none",
            padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 22,
            transition: ".18s", cursor: "pointer"
          }}>
          {showForm ? "Vazgeç" : "Not Ekle"}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit}
            style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 24, boxShadow: "0 1px 8px #2e59ab09" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <select value={noteType} onChange={e => setNoteType(e.target.value)}
                style={{
                  fontWeight: 700, borderRadius: 8, padding: "7px 10px", border: "1px solid #ddd",
                  color: NOT_TYPES.find(n => n.value === noteType).color
                }}>
                {NOT_TYPES.map(nt => (
                  <option key={nt.value} value={nt.value}>{nt.label}</option>
                ))}
              </select>
              <input
                style={{ flex: 2, padding: "7px 9px", borderRadius: 8, border: "1px solid #ddd", fontWeight: 600 }}
                type="text" placeholder="Başlık" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} maxLength={45} />
            </div>
            <textarea
              style={{ width: "100%", borderRadius: 8, border: "1px solid #ddd", padding: "7px 9px", fontSize: 16, minHeight: 50, fontWeight: 500 }}
              placeholder="Detay..." value={noteDesc} onChange={e => setNoteDesc(e.target.value)} maxLength={220} />
            <div style={{ textAlign: "right" }}>
              <button
                type="submit"
                style={{
                  background: "#18c671", color: "#fff", border: "none", padding: "8px 22px",
                  borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer"
                }}>
                {editIndex >= 0 ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </form>
        )}

        {notes.length === 0 && (
          <div style={{
            color: "#777", background: "#e4f1fb", padding: 18, borderRadius: 11,
            fontWeight: 500, textAlign: "center", marginTop: 10
          }}>
            Henüz not eklenmedi. “Not Ekle”ye basarak önemli bir uyarı veya hatırlatıcı oluşturabilirsiniz.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {notes.map((note, i) => {
            const nt = NOT_TYPES.find(n => n.value === note.type);
            return (
              <div key={i} style={{
                background: "#f9fbfd",
                borderLeft: `7px solid ${nt.color}`,
                borderRadius: 9,
                boxShadow: "0 1px 8px #2e59ab09",
                padding: "14px 15px 13px 18px",
                position: "relative"
              }}>
                <span style={{
                  background: nt.color,
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 7,
                  fontSize: 14,
                  padding: "3px 12px 3px 10px",
                  marginRight: 10,
                  position: "absolute",
                  left: -2,
                  top: -14,
                  boxShadow: "0 1px 8px #2e59ab12"
                }}>{nt.label}</span>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 18, marginBottom: 2 }}>{note.title}</div>
                <div style={{ color: "#435", fontSize: 15, marginBottom: 2 }}>{note.desc}</div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 3 }}>{note.date}</div>
                <div style={{ position: "absolute", right: 14, top: 10, display: "flex", gap: 6 }}>
                  <button onClick={() => handleEdit(i)} style={{
                    background: "#fff",
                    border: "1px solid #aaa",
                    borderRadius: 6,
                    color: "#199cdf",
                    fontWeight: 600,
                    fontSize: 14,
                    padding: "2px 12px",
                    cursor: "pointer"
                  }}>Düzenle</button>
                  <button onClick={() => handleDelete(i)} style={{
                    background: "#fff",
                    border: "1px solid #aaa",
                    borderRadius: 6,
                    color: "#ef4c3b",
                    fontWeight: 600,
                    fontSize: 14,
                    padding: "2px 12px",
                    cursor: "pointer"
                  }}>Sil</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

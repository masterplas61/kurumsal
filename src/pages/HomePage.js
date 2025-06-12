import React, { useState, useEffect, useRef } from "react";
import logo from "../masterplast-logo.png";

const NOT_TYPES = [
  { value: "bilgi", label: "Bilgi", color: "#199cdf" },
  { value: "uyari", label: "Uyarı", color: "#f6c400" },
  { value: "kritik", label: "Kritik", color: "#ef4c3b" },
  { value: "gorev", label: "Görev", color: "#18c671" },
];

const TABS = [
  { key: "notes", label: "Notlar & Hatırlatıcılar" },
  { key: "customers", label: "Müşteri Arşivi" },
  { key: "tasks", label: "Görevler" },
  { key: "stock", label: "Stok Listesi" },
  { key: "projects", label: "Teklif/Proje" },
  { key: "suppliers", label: "Tedarikçiler" },
  { key: "employees", label: "Çalışanlar" },
];

const NOTIF_SOUND = "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa8c2d.mp3";

export default function HomePage() {
  // ------------------ NOTLAR ------------------
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteType, setNoteType] = useState("bilgi");
  const [noteDateTime, setNoteDateTime] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [filterNote, setFilterNote] = useState("");
  const [alertNoteIdx, setAlertNoteIdx] = useState(null);
  const notifAudio = useRef(null);

  // ------------------ MÜŞTERİ ------------------
  const [customers, setCustomers] = useState([]);
  const [showCustForm, setShowCustForm] = useState(false);
  const [custData, setCustData] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [editCustIndex, setEditCustIndex] = useState(-1);
  const [filterCust, setFilterCust] = useState("");

  // ------------------ GÖREVLER ------------------
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskData, setTaskData] = useState({ title: "", desc: "", date: "", assigned: "", done: false });
  const [editTaskIndex, setEditTaskIndex] = useState(-1);
  const [filterTask, setFilterTask] = useState("");

  // ------------------ STOK ------------------
  const [stocks, setStocks] = useState([]);
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockData, setStockData] = useState({ code: "", name: "", qty: "", unit: "adet", min: "", desc: "" });
  const [editStockIndex, setEditStockIndex] = useState(-1);
  const [filterStock, setFilterStock] = useState("");

  // ------------------ TEKLİF/PROJE ------------------
  const [projects, setProjects] = useState([]);
  const [showProjForm, setShowProjForm] = useState(false);
  const [projData, setProjData] = useState({ name: "", customer: "", date: "", amount: "", status: "Teklif Verildi", desc: "" });
  const [editProjIndex, setEditProjIndex] = useState(-1);
  const [filterProj, setFilterProj] = useState("");

  // ------------------ TEDARİKÇİ ------------------
  const [suppliers, setSuppliers] = useState([]);
  const [showSuppForm, setShowSuppForm] = useState(false);
  const [suppData, setSuppData] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [editSuppIndex, setEditSuppIndex] = useState(-1);
  const [filterSupp, setFilterSupp] = useState("");

  // ------------------ ÇALIŞAN ------------------
  const [employees, setEmployees] = useState([]);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [empData, setEmpData] = useState({ name: "", phone: "", email: "", start: "", position: "", note: "" });
  const [editEmpIndex, setEditEmpIndex] = useState(-1);
  const [filterEmp, setFilterEmp] = useState("");

  // ------------------ SEKME STATE ------------------
  const [activeTab, setActiveTab] = useState("notes");

  // ------------------ STORAGE KURULUM ------------------
  useEffect(() => { setNotes(JSON.parse(localStorage.getItem("dashboardNotes")) || []); }, []);
  useEffect(() => { localStorage.setItem("dashboardNotes", JSON.stringify(notes)); }, [notes]);
  useEffect(() => { setCustomers(JSON.parse(localStorage.getItem("dashboardCustomers")) || []); }, []);
  useEffect(() => { localStorage.setItem("dashboardCustomers", JSON.stringify(customers)); }, [customers]);
  useEffect(() => { setTasks(JSON.parse(localStorage.getItem("dashboardTasks")) || []); }, []);
  useEffect(() => { localStorage.setItem("dashboardTasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { setStocks(JSON.parse(localStorage.getItem("dashboardStocks")) || []); }, []);
  useEffect(() => { localStorage.setItem("dashboardStocks", JSON.stringify(stocks)); }, [stocks]);
  useEffect(() => { setProjects(JSON.parse(localStorage.getItem("dashboardProjects")) || []); }, []);
  useEffect(() => { localStorage.setItem("dashboardProjects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { setSuppliers(JSON.parse(localStorage.getItem("dashboardSuppliers")) || []); }, []);
  useEffect(() => { localStorage.setItem("dashboardSuppliers", JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { setEmployees(JSON.parse(localStorage.getItem("dashboardEmployees")) || []); }, []);
  useEffect(() => { localStorage.setItem("dashboardEmployees", JSON.stringify(employees)); }, [employees]);

  // ------------------ NOTLAR FONKSİYON ------------------
  function handleSubmit(e) {
    e.preventDefault();
    if (!noteTitle.trim() && !noteDesc.trim()) return;
    const newNote = {
      title: noteTitle.trim(),
      desc: noteDesc.trim(),
      type: noteType,
      date: new Date().toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }),
      remindAt: noteDateTime,
      reminded: false
    };
    if (editIndex >= 0) {
      const updated = [...notes];
      updated[editIndex] = newNote;
      setNotes(updated);
      setEditIndex(-1);
    } else {
      setNotes([newNote, ...notes]);
    }
    setNoteTitle(""); setNoteDesc(""); setNoteType("bilgi"); setNoteDateTime(""); setShowForm(false);
  }
  function handleEdit(i) {
    setEditIndex(i);
    setNoteTitle(notes[i].title); setNoteDesc(notes[i].desc);
    setNoteType(notes[i].type); setNoteDateTime(notes[i].remindAt || ""); setShowForm(true);
  }
  function handleDelete(i) {
    if (window.confirm("Not silinsin mi?")) { setNotes(notes.filter((_, idx) => idx !== i)); setEditIndex(-1); }
  }

  // HATIRLATICI KONTROL (her 30sn)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      notes.forEach((n, idx) => {
        if (n.remindAt && !n.reminded && new Date(n.remindAt) <= now) {
          setAlertNoteIdx(idx);
          setNotes(prev => prev.map((note, i) => i === idx ? { ...note, reminded: true } : note));
          if (notifAudio.current) notifAudio.current.play();
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [notes]);
  useEffect(() => { // ilk açılışta da kontrol
    const now = new Date();
    notes.forEach((n, idx) => {
      if (n.remindAt && !n.reminded && new Date(n.remindAt) <= now) {
        setAlertNoteIdx(idx);
        setNotes(prev => prev.map((note, i) => i === idx ? { ...note, reminded: true } : note));
        if (notifAudio.current) notifAudio.current.play();
      }
    });
  }, []);
  function closeAlert() { setAlertNoteIdx(null); }

  // ------------------ MÜŞTERİ FONKSİYON ------------------
  function handleCustSubmit(e) {
    e.preventDefault();
    if (!custData.name.trim()) return;
    const newCust = { ...custData, date: new Date().toLocaleDateString("tr-TR") };
    if (editCustIndex >= 0) {
      const updated = [...customers];
      updated[editCustIndex] = newCust;
      setCustomers(updated);
      setEditCustIndex(-1);
    } else {
      setCustomers([newCust, ...customers]);
    }
    setCustData({ name: "", phone: "", email: "", address: "", note: "" }); setShowCustForm(false);
  }
  function handleCustEdit(i) { setEditCustIndex(i); setCustData(customers[i]); setShowCustForm(true); }
  function handleCustDelete(i) { if (window.confirm("Müşteri silinsin mi?")) { setCustomers(customers.filter((_, idx) => idx !== i)); setEditCustIndex(-1); } }

  // ------------------ GÖREV FONKSİYON ------------------
  function handleTaskSubmit(e) {
    e.preventDefault();
    if (!taskData.title.trim()) return;
    const newTask = { ...taskData, done: !!taskData.done, dateCreated: new Date().toLocaleString("tr-TR") };
    if (editTaskIndex >= 0) {
      const updated = [...tasks];
      updated[editTaskIndex] = newTask;
      setTasks(updated);
      setEditTaskIndex(-1);
    } else {
      setTasks([newTask, ...tasks]);
    }
    setTaskData({ title: "", desc: "", date: "", assigned: "", done: false }); setShowTaskForm(false);
  }
  function handleTaskEdit(i) { setEditTaskIndex(i); setTaskData(tasks[i]); setShowTaskForm(true); }
  function handleTaskDelete(i) { if (window.confirm("Görev silinsin mi?")) { setTasks(tasks.filter((_, idx) => idx !== i)); setEditTaskIndex(-1); } }
  function handleTaskDone(i) { setTasks(tasks.map((t, idx) => idx === i ? { ...t, done: !t.done } : t)); }

  // ------------------ STOK FONKSİYON ------------------
  function handleStockSubmit(e) {
    e.preventDefault();
    if (!stockData.name.trim()) return;
    const newStock = { ...stockData, date: new Date().toLocaleDateString("tr-TR") };
    if (editStockIndex >= 0) {
      const updated = [...stocks];
      updated[editStockIndex] = newStock;
      setStocks(updated);
      setEditStockIndex(-1);
    } else {
      setStocks([newStock, ...stocks]);
    }
    setStockData({ code: "", name: "", qty: "", unit: "adet", min: "", desc: "" }); setShowStockForm(false);
  }
  function handleStockEdit(i) { setEditStockIndex(i); setStockData(stocks[i]); setShowStockForm(true); }
  function handleStockDelete(i) { if (window.confirm("Stok kaydı silinsin mi?")) { setStocks(stocks.filter((_, idx) => idx !== i)); setEditStockIndex(-1); } }

  // ------------------ TEKLİF/PROJE FONKSİYON ------------------
  function handleProjSubmit(e) {
    e.preventDefault();
    if (!projData.name.trim()) return;
    const newProj = { ...projData, dateCreated: new Date().toLocaleDateString("tr-TR") };
    if (editProjIndex >= 0) {
      const updated = [...projects];
      updated[editProjIndex] = newProj;
      setProjects(updated);
      setEditProjIndex(-1);
    } else {
      setProjects([newProj, ...projects]);
    }
    setProjData({ name: "", customer: "", date: "", amount: "", status: "Teklif Verildi", desc: "" }); setShowProjForm(false);
  }
  function handleProjEdit(i) { setEditProjIndex(i); setProjData(projects[i]); setShowProjForm(true); }
  function handleProjDelete(i) { if (window.confirm("Teklif/Proje silinsin mi?")) { setProjects(projects.filter((_, idx) => idx !== i)); setEditProjIndex(-1); } }

  // ------------------ TEDARİKÇİ FONKSİYON ------------------
  function handleSuppSubmit(e) {
    e.preventDefault();
    if (!suppData.name.trim()) return;
    const newSupp = { ...suppData, date: new Date().toLocaleDateString("tr-TR") };
    if (editSuppIndex >= 0) {
      const updated = [...suppliers];
      updated[editSuppIndex] = newSupp;
      setSuppliers(updated);
      setEditSuppIndex(-1);
    } else {
      setSuppliers([newSupp, ...suppliers]);
    }
    setSuppData({ name: "", phone: "", email: "", address: "", note: "" }); setShowSuppForm(false);
  }
  function handleSuppEdit(i) { setEditSuppIndex(i); setSuppData(suppliers[i]); setShowSuppForm(true); }
  function handleSuppDelete(i) { if (window.confirm("Tedarikçi silinsin mi?")) { setSuppliers(suppliers.filter((_, idx) => idx !== i)); setEditSuppIndex(-1); } }

  // ------------------ ÇALIŞAN FONKSİYON ------------------
  function handleEmpSubmit(e) {
    e.preventDefault();
    if (!empData.name.trim()) return;
    const newEmp = { ...empData, date: new Date().toLocaleDateString("tr-TR") };
    if (editEmpIndex >= 0) {
      const updated = [...employees];
      updated[editEmpIndex] = newEmp;
      setEmployees(updated);
      setEditEmpIndex(-1);
    } else {
      setEmployees([newEmp, ...employees]);
    }
    setEmpData({ name: "", phone: "", email: "", start: "", position: "", note: "" }); setShowEmpForm(false);
  }
  function handleEmpEdit(i) { setEditEmpIndex(i); setEmpData(employees[i]); setShowEmpForm(true); }
  function handleEmpDelete(i) { if (window.confirm("Çalışan silinsin mi?")) { setEmployees(employees.filter((_, idx) => idx !== i)); setEditEmpIndex(-1); } }

  // ------------------ FİLTRELİ VERİLER ------------------
  const filteredNotes = notes.filter(note => (note.title + " " + note.desc).toLowerCase().includes(filterNote.trim().toLowerCase()));
  const filteredCustomers = customers.filter(c => (c.name + " " + c.phone + " " + c.email + " " + c.note + " " + c.address).toLowerCase().includes(filterCust.trim().toLowerCase()));
  const filteredTasks = tasks.filter(t => (t.title + " " + t.desc + " " + t.assigned).toLowerCase().includes(filterTask.trim().toLowerCase()));
  const filteredStocks = stocks.filter(s => (s.name + " " + s.code + " " + s.desc).toLowerCase().includes(filterStock.trim().toLowerCase()));
  const filteredProjects = projects.filter(p => (p.name + " " + p.customer + " " + p.status + " " + p.desc).toLowerCase().includes(filterProj.trim().toLowerCase()));
  const filteredSuppliers = suppliers.filter(s => (s.name + " " + s.phone + " " + s.email + " " + s.address + " " + s.note).toLowerCase().includes(filterSupp.trim().toLowerCase()));
  const filteredEmployees = employees.filter(e => (e.name + " " + e.phone + " " + e.email + " " + e.position + " " + e.note).toLowerCase().includes(filterEmp.trim().toLowerCase()));

  // ------------------ EKRAN ------------------
  return (
    <div style={{
      minHeight: "100vh", background: "#f6fafd",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 0"
    }}>
      <audio ref={notifAudio} src={NOTIF_SOUND} />
      <img src={logo} alt="Masterplast Logo" style={{ width: 210, margin: "0 0 24px 0" }} />
      {/* TAB BAR */}
      <div style={{
        display: "flex", gap: 3, marginBottom: 32,
        background: "#eaf1fc", borderRadius: 14, overflow: "hidden",
        boxShadow: "0 2px 14px #2e59ab11"
      }}>
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "9px 23px",
              background: activeTab === tab.key ? "#fff" : "transparent",
              border: "none", borderBottom: activeTab === tab.key ? "3px solid #199cdf" : "3px solid transparent",
              color: activeTab === tab.key ? "#199cdf" : "#333",
              fontWeight: 700, fontSize: 16,
              cursor: "pointer", transition: ".18s"
            }}>
            {tab.label}
          </button>
        ))}
      </div>
      {/* --- NOTLAR & HATIRLATICILAR --- */}
      {activeTab === "notes" && (
        <div style={{
          maxWidth: 520, width: "100%", background: "#fff", borderRadius: 18,
          padding: "24px 28px 16px 28px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32
        }}>
          <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 23, marginBottom: 10 }}>Notlar & Hatırlatıcılar</h2>
          <input value={filterNote} onChange={e => setFilterNote(e.target.value)} placeholder="Ara/Filtrele..." style={{ width: "100%", marginBottom: 12, border: "1px solid #cce", borderRadius: 9, padding: "8px 12px", fontSize: 15 }} />
          <button onClick={() => { setShowForm(!showForm); setEditIndex(-1); setNoteTitle(""); setNoteDesc(""); setNoteType("bilgi"); setNoteDateTime(""); }} style={{ background: "#199cdf", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 18, transition: ".18s", cursor: "pointer" }}>
            {showForm ? "Vazgeç" : "Not Ekle"}
          </button>
          {showForm && (
            <form onSubmit={handleSubmit} style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 18, boxShadow: "0 1px 8px #2e59ab09" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={noteType} onChange={e => setNoteType(e.target.value)} style={{ fontWeight: 700, borderRadius: 8, padding: "7px 10px", border: "1px solid #ddd", color: NOT_TYPES.find(n => n.value === noteType).color }}>
                  {NOT_TYPES.map(nt => (<option key={nt.value} value={nt.value}>{nt.label}</option>))}
                </select>
                <input style={{ flex: 2, padding: "7px 9px", borderRadius: 8, border: "1px solid #ddd", fontWeight: 600 }} type="text" placeholder="Başlık" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} maxLength={45} />
              </div>
              <textarea style={{ width: "100%", borderRadius: 8, border: "1px solid #ddd", padding: "7px 9px", fontSize: 16, minHeight: 50, fontWeight: 500 }} placeholder="Detay..." value={noteDesc} onChange={e => setNoteDesc(e.target.value)} maxLength={220} />
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 9 }}>
                <label style={{ color: "#888", fontWeight: 600, fontSize: 15 }}>Hatırlatıcı:</label>
                <input type="datetime-local" value={noteDateTime} onChange={e => setNoteDateTime(e.target.value)} style={{ borderRadius: 7, border: "1px solid #ddd", padding: "6px 10px", fontSize: 15 }} />
                {noteDateTime && <span style={{ fontSize: 14, color: "#aaa" }}>{noteDateTime.replace("T", " ")}</span>}
              </div>
              <div style={{ textAlign: "right" }}>
                <button type="submit" style={{ background: "#18c671", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer" }}>
                  {editIndex >= 0 ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          )}
          {filteredNotes.length === 0 && (<div style={{ color: "#777", background: "#e4f1fb", padding: 14, borderRadius: 11, fontWeight: 500, textAlign: "center", marginTop: 8 }}>Sonuç yok veya henüz not eklenmedi.</div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredNotes.map((note, i) => {
              const nt = NOT_TYPES.find(n => n.value === note.type);
              const remindPassed = note.remindAt && new Date(note.remindAt) <= new Date();
              return (
                <div key={i} style={{
                  background: "#f9fbfd",
                  borderLeft: `7px solid ${nt.color}`,
                  borderRadius: 9,
                  boxShadow: "0 1px 8px #2e59ab09",
                  padding: "11px 13px 10px 17px",
                  position: "relative",
                  opacity: note.reminded && remindPassed ? 0.7 : 1
                }}>
                  <span style={{ background: nt.color, color: "#fff", fontWeight: 700, borderRadius: 7, fontSize: 14, padding: "3px 12px 3px 10px", marginRight: 10, position: "absolute", left: -2, top: -14, boxShadow: "0 1px 8px #2e59ab12" }}>{nt.label}</span>
                  <div style={{ fontWeight: 600, color: "#222", fontSize: 17, marginBottom: 2 }}>{note.title}</div>
                  <div style={{ color: "#435", fontSize: 14, marginBottom: 2 }}>{note.desc}</div>
                  {note.remindAt && (<div style={{ color: remindPassed ? "#ef4c3b" : "#199cdf", fontSize: 14, marginBottom: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", display: "inline-block", background: remindPassed ? "#ef4c3b" : "#18c671" }}></span>
                    {remindPassed ? "Geçti!" : "Bekleniyor:"} {note.remindAt.replace("T", " ")}
                  </div>)}
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 3 }}>{note.date}</div>
                  <div style={{ position: "absolute", right: 14, top: 10, display: "flex", gap: 6 }}>
                    <button onClick={() => handleEdit(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#199cdf", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Düzenle</button>
                    <button onClick={() => handleDelete(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#ef4c3b", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Sil</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* HATIRLATICI MODAL */}
      {alertNoteIdx !== null && filteredNotes[alertNoteIdx] && (
        <div style={{ position: "fixed", left: 0, right: 0, top: 0, bottom: 0, background: "#001d3355", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 32, borderRadius: 18, minWidth: 310, boxShadow: "0 3px 40px #0006", textAlign: "center", fontSize: 21, color: "#ef4c3b", fontWeight: 700 }}>
            <div style={{ fontSize: 33, marginBottom: 16 }}>🔔</div>
            <div>
              <span style={{ color: "#333" }}>
                <b>Hatırlatıcı zamanı geldi!</b>
              </span>
              <br />
              <b style={{ color: "#199cdf" }}>{filteredNotes[alertNoteIdx]?.title}</b>
              <div style={{ color: "#444", fontSize: 17, marginTop: 8 }}>
                {filteredNotes[alertNoteIdx]?.desc}
              </div>
              <div style={{ color: "#888", marginTop: 13, fontSize: 15 }}>
                {filteredNotes[alertNoteIdx]?.remindAt?.replace("T", " ")}
              </div>
            </div>
            <button onClick={closeAlert} style={{ background: "#18c671", color: "#fff", border: "none", padding: "10px 32px", borderRadius: 11, fontWeight: 600, fontSize: 17, marginTop: 22, cursor: "pointer" }}>Tamam</button>
          </div>
        </div>
      )}
      {/* --- MÜŞTERİ ARŞİVİ --- */}
      {activeTab === "customers" && (
        <div style={{ maxWidth: 620, width: "100%", background: "#fff", borderRadius: 18, padding: "22px 27px 12px 27px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32 }}>
          <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Müşteri Arşivi</h2>
          <input value={filterCust} onChange={e => setFilterCust(e.target.value)} placeholder="Ara/Filtrele..." style={{ width: "100%", marginBottom: 12, border: "1px solid #cce", borderRadius: 9, padding: "8px 12px", fontSize: 15 }} />
          <button onClick={() => { setShowCustForm(!showCustForm); setEditCustIndex(-1); setCustData({ name: "", phone: "", email: "", address: "", note: "" }); }} style={{ background: "#199cdf", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 18, transition: ".18s", cursor: "pointer" }}>
            {showCustForm ? "Vazgeç" : "Müşteri Ekle"}
          </button>
          {showCustForm && (
            <form onSubmit={handleCustSubmit} style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 18, boxShadow: "0 1px 8px #2e59ab09", display: "flex", flexDirection: "column", gap: 9 }}>
              <input type="text" required placeholder="Müşteri Adı" value={custData.name} maxLength={50} onChange={e => setCustData(d => ({ ...d, name: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd", fontWeight: 600 }} />
              <input type="text" placeholder="Telefon" value={custData.phone} maxLength={20} onChange={e => setCustData(d => ({ ...d, phone: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="email" placeholder="E-posta" value={custData.email} maxLength={40} onChange={e => setCustData(d => ({ ...d, email: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Adres" value={custData.address} maxLength={70} onChange={e => setCustData(d => ({ ...d, address: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Not" value={custData.note} maxLength={100} onChange={e => setCustData(d => ({ ...d, note: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <div style={{ textAlign: "right" }}>
                <button type="submit" style={{ background: "#18c671", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer" }}>
                  {editCustIndex >= 0 ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          )}
          {filteredCustomers.length === 0 && (<div style={{ color: "#777", background: "#e4f1fb", padding: 14, borderRadius: 11, fontWeight: 500, textAlign: "center", marginTop: 8 }}>Sonuç yok veya henüz müşteri kaydı yok.</div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {filteredCustomers.map((cust, i) => (
              <div key={i} style={{ background: "#f9fbfd", borderLeft: `7px solid #199cdf`, borderRadius: 9, boxShadow: "0 1px 8px #2e59ab09", padding: "12px 14px 11px 17px", position: "relative" }}>
                <div style={{ fontWeight: 700, color: "#165", fontSize: 17, marginBottom: 2 }}>{cust.name}</div>
                <div style={{ color: "#456", fontSize: 15 }}>
                  {cust.phone && <>📞 <span style={{ fontWeight: 600 }}>{cust.phone}</span><br /></>}
                  {cust.email && <>✉️ <span style={{ fontWeight: 600 }}>{cust.email}</span><br /></>}
                  {cust.address && <>🏠 <span>{cust.address}</span><br /></>}
                </div>
                {cust.note && <div style={{ color: "#556", fontSize: 14, marginBottom: 2 }}>📝 {cust.note}</div>}
                <div style={{ color: "#aaa", fontSize: 13 }}>{cust.date}</div>
                <div style={{ position: "absolute", right: 14, top: 8, display: "flex", gap: 6 }}>
                  <button onClick={() => handleCustEdit(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#199cdf", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Düzenle</button>
                  <button onClick={() => handleCustDelete(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#ef4c3b", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- GÖREVLER --- */}
      {activeTab === "tasks" && (
        <div style={{ maxWidth: 520, width: "100%", background: "#fff", borderRadius: 18, padding: "22px 27px 12px 27px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32 }}>
          <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Görevler</h2>
          <input value={filterTask} onChange={e => setFilterTask(e.target.value)} placeholder="Ara/Filtrele..." style={{ width: "100%", marginBottom: 12, border: "1px solid #cce", borderRadius: 9, padding: "8px 12px", fontSize: 15 }} />
          <button onClick={() => { setShowTaskForm(!showTaskForm); setEditTaskIndex(-1); setTaskData({ title: "", desc: "", date: "", assigned: "", done: false }); }} style={{ background: "#199cdf", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 18, transition: ".18s", cursor: "pointer" }}>
            {showTaskForm ? "Vazgeç" : "Görev Ekle"}
          </button>
          {showTaskForm && (
            <form onSubmit={handleTaskSubmit} style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 18, boxShadow: "0 1px 8px #2e59ab09", display: "flex", flexDirection: "column", gap: 9 }}>
              <input type="text" required placeholder="Görev Başlığı" value={taskData.title} maxLength={40} onChange={e => setTaskData(d => ({ ...d, title: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd", fontWeight: 600 }} />
              <input type="text" placeholder="Açıklama" value={taskData.desc} maxLength={120} onChange={e => setTaskData(d => ({ ...d, desc: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="date" placeholder="Tarih" value={taskData.date} onChange={e => setTaskData(d => ({ ...d, date: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Sorumlu" value={taskData.assigned} maxLength={30} onChange={e => setTaskData(d => ({ ...d, assigned: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <label style={{ fontWeight: 500, fontSize: 15, color: "#888" }}>
                <input type="checkbox" checked={taskData.done} onChange={e => setTaskData(d => ({ ...d, done: e.target.checked }))} /> Tamamlandı
              </label>
              <div style={{ textAlign: "right" }}>
                <button type="submit" style={{ background: "#18c671", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer" }}>
                  {editTaskIndex >= 0 ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          )}
          {filteredTasks.length === 0 && (<div style={{ color: "#777", background: "#e4f1fb", padding: 14, borderRadius: 11, fontWeight: 500, textAlign: "center", marginTop: 8 }}>Sonuç yok veya henüz görev eklenmedi.</div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {filteredTasks.map((task, i) => (
              <div key={i} style={{
                background: "#f9fbfd",
                borderLeft: `7px solid ${task.done ? "#18c671" : "#f6c400"}`,
                borderRadius: 9,
                boxShadow: "0 1px 8px #2e59ab09",
                padding: "11px 13px 10px 17px",
                position: "relative",
                opacity: task.done ? 0.7 : 1
              }}>
                <div style={{ fontWeight: 600, color: "#333", fontSize: 17, marginBottom: 1 }}>{task.title}</div>
                {task.desc && <div style={{ color: "#456", fontSize: 14 }}>{task.desc}</div>}
                <div style={{ color: "#888", fontSize: 14, margin: "3px 0 0 0" }}>{task.date ? "📅 " + task.date : ""} {task.assigned ? "👤 " + task.assigned : ""}</div>
                <div style={{ position: "absolute", right: 14, top: 10, display: "flex", gap: 6 }}>
                  <button onClick={() => handleTaskEdit(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#199cdf", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Düzenle</button>
                  <button onClick={() => handleTaskDelete(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#ef4c3b", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Sil</button>
                  <button onClick={() => handleTaskDone(i)} style={{ background: "#18c671", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>
                    {task.done ? "✓" : "Tamamla"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- STOK LİSTESİ --- */}
      {activeTab === "stock" && (
        <div style={{ maxWidth: 540, width: "100%", background: "#fff", borderRadius: 18, padding: "22px 27px 12px 27px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32 }}>
          <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Stok Listesi</h2>
          <input value={filterStock} onChange={e => setFilterStock(e.target.value)} placeholder="Ara/Filtrele..." style={{ width: "100%", marginBottom: 12, border: "1px solid #cce", borderRadius: 9, padding: "8px 12px", fontSize: 15 }} />
          <button onClick={() => { setShowStockForm(!showStockForm); setEditStockIndex(-1); setStockData({ code: "", name: "", qty: "", unit: "adet", min: "", desc: "" }); }} style={{ background: "#199cdf", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 18, transition: ".18s", cursor: "pointer" }}>
            {showStockForm ? "Vazgeç" : "Stok Ekle"}
          </button>
          {showStockForm && (
            <form onSubmit={handleStockSubmit} style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 18, boxShadow: "0 1px 8px #2e59ab09", display: "flex", flexDirection: "column", gap: 9 }}>
              <input type="text" placeholder="Stok Kodu" value={stockData.code} maxLength={30} onChange={e => setStockData(d => ({ ...d, code: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" required placeholder="Ürün Adı" value={stockData.name} maxLength={50} onChange={e => setStockData(d => ({ ...d, name: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd", fontWeight: 600 }} />
              <input type="number" min="0" step="0.01" placeholder="Miktar" value={stockData.qty} onChange={e => setStockData(d => ({ ...d, qty: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <select value={stockData.unit} onChange={e => setStockData(d => ({ ...d, unit: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }}>
                <option value="adet">Adet</option>
                <option value="kg">kg</option>
                <option value="lt">lt</option>
                <option value="m">m</option>
              </select>
              <input type="number" min="0" placeholder="Min. Seviye (Alarm)" value={stockData.min} onChange={e => setStockData(d => ({ ...d, min: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Açıklama" value={stockData.desc} maxLength={100} onChange={e => setStockData(d => ({ ...d, desc: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <div style={{ textAlign: "right" }}>
                <button type="submit" style={{ background: "#18c671", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer" }}>
                  {editStockIndex >= 0 ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          )}
          {filteredStocks.length === 0 && (<div style={{ color: "#777", background: "#e4f1fb", padding: 14, borderRadius: 11, fontWeight: 500, textAlign: "center", marginTop: 8 }}>Sonuç yok veya henüz stok eklenmedi.</div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {filteredStocks.map((stock, i) => {
              const alarm = stock.min && parseFloat(stock.qty) <= parseFloat(stock.min);
              return (
                <div key={i} style={{
                  background: "#f9fbfd",
                  borderLeft: `7px solid ${alarm ? "#ef4c3b" : "#199cdf"}`,
                  borderRadius: 9,
                  boxShadow: "0 1px 8px #2e59ab09",
                  padding: "11px 13px 10px 17px",
                  position: "relative"
                }}>
                  <div style={{ fontWeight: 600, color: "#333", fontSize: 17, marginBottom: 2 }}>{stock.name} <span style={{ fontWeight: 500, fontSize: 13, color: "#888" }}>{stock.code && ("- " + stock.code)}</span></div>
                  <div style={{ color: "#888", fontSize: 15 }}>{stock.qty} {stock.unit} {stock.min && <span style={{ color: alarm ? "#ef4c3b" : "#18c671" }}>(Min:{stock.min})</span>}</div>
                  {stock.desc && <div style={{ color: "#556", fontSize: 13 }}>{stock.desc}</div>}
                  <div style={{ color: "#aaa", fontSize: 12 }}>{stock.date}</div>
                  <div style={{ position: "absolute", right: 14, top: 10, display: "flex", gap: 6 }}>
                    <button onClick={() => handleStockEdit(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#199cdf", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Düzenle</button>
                    <button onClick={() => handleStockDelete(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#ef4c3b", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Sil</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* --- TEKLİF/PROJE --- */}
      {activeTab === "projects" && (
        <div style={{ maxWidth: 540, width: "100%", background: "#fff", borderRadius: 18, padding: "22px 27px 12px 27px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32 }}>
          <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Teklif/Proje Arşivi</h2>
          <input value={filterProj} onChange={e => setFilterProj(e.target.value)} placeholder="Ara/Filtrele..." style={{ width: "100%", marginBottom: 12, border: "1px solid #cce", borderRadius: 9, padding: "8px 12px", fontSize: 15 }} />
          <button onClick={() => { setShowProjForm(!showProjForm); setEditProjIndex(-1); setProjData({ name: "", customer: "", date: "", amount: "", status: "Teklif Verildi", desc: "" }); }} style={{ background: "#199cdf", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 18, transition: ".18s", cursor: "pointer" }}>
            {showProjForm ? "Vazgeç" : "Teklif/Proje Ekle"}
          </button>
          {showProjForm && (
            <form onSubmit={handleProjSubmit} style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 18, boxShadow: "0 1px 8px #2e59ab09", display: "flex", flexDirection: "column", gap: 9 }}>
              <input type="text" required placeholder="Proje/Teklif Adı" value={projData.name} maxLength={60} onChange={e => setProjData(d => ({ ...d, name: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd", fontWeight: 600 }} />
              <input type="text" placeholder="Müşteri" value={projData.customer} maxLength={40} onChange={e => setProjData(d => ({ ...d, customer: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="date" placeholder="Tarih" value={projData.date} onChange={e => setProjData(d => ({ ...d, date: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="number" min="0" placeholder="Tutar" value={projData.amount} onChange={e => setProjData(d => ({ ...d, amount: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <select value={projData.status} onChange={e => setProjData(d => ({ ...d, status: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }}>
                <option value="Teklif Verildi">Teklif Verildi</option>
                <option value="Devam Ediyor">Devam Ediyor</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="İptal">İptal</option>
              </select>
              <input type="text" placeholder="Açıklama" value={projData.desc} maxLength={100} onChange={e => setProjData(d => ({ ...d, desc: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <div style={{ textAlign: "right" }}>
                <button type="submit" style={{ background: "#18c671", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer" }}>
                  {editProjIndex >= 0 ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          )}
          {filteredProjects.length === 0 && (<div style={{ color: "#777", background: "#e4f1fb", padding: 14, borderRadius: 11, fontWeight: 500, textAlign: "center", marginTop: 8 }}>Sonuç yok veya henüz teklif/proje eklenmedi.</div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {filteredProjects.map((proj, i) => (
              <div key={i} style={{
                background: "#f9fbfd",
                borderLeft: `7px solid #18c671`,
                borderRadius: 9,
                boxShadow: "0 1px 8px #2e59ab09",
                padding: "11px 13px 10px 17px",
                position: "relative"
              }}>
                <div style={{ fontWeight: 600, color: "#333", fontSize: 17, marginBottom: 1 }}>{proj.name}</div>
                <div style={{ color: "#888", fontSize: 14 }}>Müşteri: {proj.customer} - {proj.date}</div>
                <div style={{ color: "#556", fontSize: 14 }}>{proj.status} {proj.amount && <span>- {proj.amount}₺</span>}</div>
                {proj.desc && <div style={{ color: "#888", fontSize: 13 }}>{proj.desc}</div>}
                <div style={{ color: "#aaa", fontSize: 12 }}>{proj.dateCreated}</div>
                <div style={{ position: "absolute", right: 14, top: 10, display: "flex", gap: 6 }}>
                  <button onClick={() => handleProjEdit(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#199cdf", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Düzenle</button>
                  <button onClick={() => handleProjDelete(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#ef4c3b", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- TEDARİKÇİLER --- */}
      {activeTab === "suppliers" && (
        <div style={{ maxWidth: 540, width: "100%", background: "#fff", borderRadius: 18, padding: "22px 27px 12px 27px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32 }}>
          <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Tedarikçi Listesi</h2>
          <input value={filterSupp} onChange={e => setFilterSupp(e.target.value)} placeholder="Ara/Filtrele..." style={{ width: "100%", marginBottom: 12, border: "1px solid #cce", borderRadius: 9, padding: "8px 12px", fontSize: 15 }} />
          <button onClick={() => { setShowSuppForm(!showSuppForm); setEditSuppIndex(-1); setSuppData({ name: "", phone: "", email: "", address: "", note: "" }); }} style={{ background: "#199cdf", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 18, transition: ".18s", cursor: "pointer" }}>
            {showSuppForm ? "Vazgeç" : "Tedarikçi Ekle"}
          </button>
          {showSuppForm && (
            <form onSubmit={handleSuppSubmit} style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 18, boxShadow: "0 1px 8px #2e59ab09", display: "flex", flexDirection: "column", gap: 9 }}>
              <input type="text" required placeholder="Tedarikçi Adı" value={suppData.name} maxLength={50} onChange={e => setSuppData(d => ({ ...d, name: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd", fontWeight: 600 }} />
              <input type="text" placeholder="Telefon" value={suppData.phone} maxLength={20} onChange={e => setSuppData(d => ({ ...d, phone: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="email" placeholder="E-posta" value={suppData.email} maxLength={40} onChange={e => setSuppData(d => ({ ...d, email: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Adres" value={suppData.address} maxLength={70} onChange={e => setSuppData(d => ({ ...d, address: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Not" value={suppData.note} maxLength={100} onChange={e => setSuppData(d => ({ ...d, note: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <div style={{ textAlign: "right" }}>
                <button type="submit" style={{ background: "#18c671", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer" }}>
                  {editSuppIndex >= 0 ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          )}
          {filteredSuppliers.length === 0 && (<div style={{ color: "#777", background: "#e4f1fb", padding: 14, borderRadius: 11, fontWeight: 500, textAlign: "center", marginTop: 8 }}>Sonuç yok veya henüz tedarikçi eklenmedi.</div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {filteredSuppliers.map((supp, i) => (
              <div key={i} style={{ background: "#f9fbfd", borderLeft: `7px solid #199cdf`, borderRadius: 9, boxShadow: "0 1px 8px #2e59ab09", padding: "11px 13px 10px 17px", position: "relative" }}>
                <div style={{ fontWeight: 700, color: "#165", fontSize: 17, marginBottom: 2 }}>{supp.name}</div>
                <div style={{ color: "#456", fontSize: 15 }}>
                  {supp.phone && <>📞 <span style={{ fontWeight: 600 }}>{supp.phone}</span><br /></>}
                  {supp.email && <>✉️ <span style={{ fontWeight: 600 }}>{supp.email}</span><br /></>}
                  {supp.address && <>🏠 <span>{supp.address}</span><br /></>}
                </div>
                {supp.note && <div style={{ color: "#556", fontSize: 14, marginBottom: 2 }}>📝 {supp.note}</div>}
                <div style={{ color: "#aaa", fontSize: 13 }}>{supp.date}</div>
                <div style={{ position: "absolute", right: 14, top: 8, display: "flex", gap: 6 }}>
                  <button onClick={() => handleSuppEdit(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#199cdf", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Düzenle</button>
                  <button onClick={() => handleSuppDelete(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#ef4c3b", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- ÇALIŞANLAR --- */}
      {activeTab === "employees" && (
        <div style={{ maxWidth: 540, width: "100%", background: "#fff", borderRadius: 18, padding: "22px 27px 12px 27px", boxShadow: "0 3px 24px rgba(30,60,100,0.09)", marginBottom: 32 }}>
          <h2 style={{ color: "#222", textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Çalışanlar</h2>
          <input value={filterEmp} onChange={e => setFilterEmp(e.target.value)} placeholder="Ara/Filtrele..." style={{ width: "100%", marginBottom: 12, border: "1px solid #cce", borderRadius: 9, padding: "8px 12px", fontSize: 15 }} />
          <button onClick={() => { setShowEmpForm(!showEmpForm); setEditEmpIndex(-1); setEmpData({ name: "", phone: "", email: "", start: "", position: "", note: "" }); }} style={{ background: "#199cdf", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 10, fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px #2e59ab16", marginBottom: 18, transition: ".18s", cursor: "pointer" }}>
            {showEmpForm ? "Vazgeç" : "Çalışan Ekle"}
          </button>
          {showEmpForm && (
            <form onSubmit={handleEmpSubmit} style={{ background: "#f9fbff", padding: 16, borderRadius: 12, marginBottom: 18, boxShadow: "0 1px 8px #2e59ab09", display: "flex", flexDirection: "column", gap: 9 }}>
              <input type="text" required placeholder="Çalışan Adı" value={empData.name} maxLength={50} onChange={e => setEmpData(d => ({ ...d, name: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd", fontWeight: 600 }} />
              <input type="text" placeholder="Telefon" value={empData.phone} maxLength={20} onChange={e => setEmpData(d => ({ ...d, phone: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="email" placeholder="E-posta" value={empData.email} maxLength={40} onChange={e => setEmpData(d => ({ ...d, email: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="date" placeholder="Başlangıç" value={empData.start} onChange={e => setEmpData(d => ({ ...d, start: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Pozisyon" value={empData.position} maxLength={40} onChange={e => setEmpData(d => ({ ...d, position: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <input type="text" placeholder="Not" value={empData.note} maxLength={100} onChange={e => setEmpData(d => ({ ...d, note: e.target.value }))} style={{ borderRadius: 8, padding: "7px 9px", border: "1px solid #ddd" }} />
              <div style={{ textAlign: "right" }}>
                <button type="submit" style={{ background: "#18c671", color: "#fff", border: "none", padding: "8px 22px", borderRadius: 9, fontWeight: 600, fontSize: 16, marginTop: 13, cursor: "pointer" }}>
                  {editEmpIndex >= 0 ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          )}
          {filteredEmployees.length === 0 && (<div style={{ color: "#777", background: "#e4f1fb", padding: 14, borderRadius: 11, fontWeight: 500, textAlign: "center", marginTop: 8 }}>Sonuç yok veya henüz çalışan eklenmedi.</div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {filteredEmployees.map((emp, i) => (
              <div key={i} style={{ background: "#f9fbfd", borderLeft: `7px solid #199cdf`, borderRadius: 9, boxShadow: "0 1px 8px #2e59ab09", padding: "11px 13px 10px 17px", position: "relative" }}>
                <div style={{ fontWeight: 700, color: "#165", fontSize: 17, marginBottom: 2 }}>{emp.name}</div>
                <div style={{ color: "#456", fontSize: 15 }}>
                  {emp.phone && <>📞 <span style={{ fontWeight: 600 }}>{emp.phone}</span><br /></>}
                  {emp.email && <>✉️ <span style={{ fontWeight: 600 }}>{emp.email}</span><br /></>}
                  {emp.start && <>⏰ <span>{emp.start}</span><br /></>}
                  {emp.position && <>🏷️ <span>{emp.position}</span><br /></>}
                </div>
                {emp.note && <div style={{ color: "#556", fontSize: 14, marginBottom: 2 }}>📝 {emp.note}</div>}
                <div style={{ color: "#aaa", fontSize: 13 }}>{emp.date}</div>
                <div style={{ position: "absolute", right: 14, top: 8, display: "flex", gap: 6 }}>
                  <button onClick={() => handleEmpEdit(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#199cdf", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Düzenle</button>
                  <button onClick={() => handleEmpDelete(i)} style={{ background: "#fff", border: "1px solid #aaa", borderRadius: 6, color: "#ef4c3b", fontWeight: 600, fontSize: 14, padding: "2px 12px", cursor: "pointer" }}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

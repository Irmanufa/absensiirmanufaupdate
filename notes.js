/* notes.js - FITUR CATATAN RAPAT & EVALUASI */
/* ============================================
   CATATAN RAPAT & EVALUASI DENGAN TTD SEKRETARIS
   ============================================ */

const NOTES_CONFIG = {
  STORAGE_KEY: "irmas_notes_data",
  WHATSAPP_NUMBER: "+6289657751448",
};

let NotesState = {
  notes: [],
};

function loadNotes() {
  try {
    NotesState.notes = JSON.parse(
      localStorage.getItem(NOTES_CONFIG.STORAGE_KEY) || "[]",
    );
  } catch (e) {
    NotesState.notes = [];
  }
}

function saveNotes() {
  localStorage.setItem(
    NOTES_CONFIG.STORAGE_KEY,
    JSON.stringify(NotesState.notes),
  );
}

function formatNoteDate(date = new Date()) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtmlNotes(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== DRAW TTD FUNCTION UNTUK NOTES =====
function drawNoteTTD(doc, x, y, name, position) {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(x, y, x + 50, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(position, x + 25, y + 5, { align: "center" });
  doc.setFontSize(9);
  doc.text(name, x + 25, y + 10, { align: "center" });
}

// ===== FUNGSI UTAMA CATATAN =====
function generatePDFFromNote(note) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(67, 97, 238);
  doc.text("CATATAN RAPAT / EVALUASI", 105, 20, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(58, 12, 163);
  doc.text("IRMAS NURUL FALAH", 105, 28, { align: "center" });
  doc.setDrawColor(67, 97, 238);
  doc.line(20, 35, 190, 35);

  let yPos = 45;

  // Judul
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Judul:", 20, yPos);
  doc.setFont("helvetica", "normal");
  const titleLines = doc.splitTextToSize(note.title, 130);
  doc.text(titleLines, 50, yPos);
  yPos += titleLines.length * 6 + 8;

  // Tanggal
  doc.setFont("helvetica", "bold");
  doc.text("Tanggal:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(note.date, 50, yPos);
  yPos += 10;

  // Isi Catatan
  doc.setFont("helvetica", "bold");
  doc.text("Isi Catatan:", 20, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const contentLines = doc.splitTextToSize(note.content, 160);
  doc.text(contentLines, 20, yPos);
  yPos += contentLines.length * 6 + 15;

  // Daftar Peserta
  if (note.peserta && note.peserta.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Daftar Peserta:", 20, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    note.peserta.forEach((p, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${idx + 1}. ${p}`, 25, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // Kesimpulan
  if (note.kesimpulan) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Kesimpulan / Tindak Lanjut:", 20, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    const kesimpulanLines = doc.splitTextToSize(note.kesimpulan, 160);
    doc.text(kesimpulanLines, 20, yPos);
    yPos += kesimpulanLines.length * 6 + 15;
  }

  // TTD Sekretaris 1 & 2
  if (yPos > 240) {
    doc.addPage();
    yPos = 30;
  }

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Mengetahui,", 105, yPos, { align: "center" });
  yPos += 20;

  // TTD Sekretaris 1 (kiri)
  drawNoteTTD(doc, 30, yPos, "Tasya Amelia Putri", "Sekretaris 1");
  // TTD Sekretaris 2 (kanan)
  drawNoteTTD(doc, 110, yPos, "Lidya Febrianti", "Sekretaris 2");

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Dokumen ini digenerate otomatis oleh Sistem Absensi IRMAS",
    105,
    280,
    { align: "center" },
  );

  // Save PDF
  doc.save(
    `Catatan_Rapat_${note.title.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`,
  );

  if (window.Toast) {
    window.Toast.success("PDF catatan berhasil didownload!");
  } else {
    alert("PDF catatan berhasil didownload!");
  }
}

function sendNoteToWhatsApp(note) {
  let message = `📋 *CATATAN RAPAT / EVALUASI IRMAS*%0A%0A`;
  message += `*Judul:* ${encodeURIComponent(note.title)}%0A`;
  message += `*Tanggal:* ${note.date}%0A%0A`;
  message += `*Isi Catatan:*%0A${encodeURIComponent(note.content)}%0A%0A`;

  if (note.peserta && note.peserta.length > 0) {
    message += `*Daftar Peserta:*%0A`;
    note.peserta.forEach((p, i) => {
      message += `${i + 1}. ${encodeURIComponent(p)}%0A`;
    });
    message += `%0A`;
  }

  if (note.kesimpulan) {
    message += `*Kesimpulan / Tindak Lanjut:*%0A${encodeURIComponent(note.kesimpulan)}%0A%0A`;
  }

  message += `_Dikirim via Sistem Absensi IRMAS_`;

  window.open(
    `https://wa.me/${NOTES_CONFIG.WHATSAPP_NUMBER}?text=${message}`,
    "_blank",
  );

  if (window.Toast) {
    window.Toast.success("Pesan berhasil dikirim ke WhatsApp!");
  } else {
    alert("Pesan berhasil dikirim ke WhatsApp!");
  }
}

function renderNotesList() {
  if (NotesState.notes.length === 0) {
    return `<div class="empty-state"><i class="fas fa-sticky-note"></i><p>Belum ada catatan</p><small>Buat catatan rapat/evaluasi baru di atas</small></div>`;
  }

  return NotesState.notes
    .slice()
    .reverse()
    .map(
      (note) => `
        <div class="note-item" data-id="${note.id}">
            <div class="note-title">
                <strong><i class="fas fa-file-alt"></i> ${escapeHtmlNotes(note.title)}</strong>
                <span class="note-date"><i class="far fa-calendar-alt"></i> ${note.date}</span>
            </div>
            <div class="note-content">
                ${escapeHtmlNotes(note.content.substring(0, 150))}${note.content.length > 150 ? "..." : ""}
            </div>
            ${note.peserta && note.peserta.length > 0 ? `<div style="font-size: 12px; color: var(--gray); margin-bottom: 10px;"><i class="fas fa-users"></i> ${note.peserta.length} peserta</div>` : ""}
            <div class="note-actions">
                <button onclick="window.viewNoteDetail(${note.id})" class="action-small" style="background: var(--primary); color: white;"><i class="fas fa-eye"></i> Detail</button>
                <button onclick="window.generatePDFFromNote(window.NotesState.notes.find(n => n.id === ${note.id}))" class="action-small" style="background: #ef4444; color: white;"><i class="fas fa-file-pdf"></i> PDF</button>
                <button onclick="window.sendNoteToWhatsApp(window.NotesState.notes.find(n => n.id === ${note.id}))" class="action-small" style="background: #22c55e; color: white;"><i class="fab fa-whatsapp"></i> WA</button>
                <button onclick="window.deleteNote(${note.id})" class="action-small" style="background: var(--gray); color: white;"><i class="fas fa-trash"></i> Hapus</button>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderNotesApp() {
  const container = document.getElementById("notesApp");
  if (!container) return;

  loadNotes();

  container.innerHTML = `
        <div class="notes-section" style="margin-top: 0;">
            <div class="form-header">
                <i class="fas fa-sticky-note"></i>
                <h3>Catatan Rapat & Evaluasi</h3>
                <small style="margin-left: auto; color: var(--primary);">Sekretaris dapat mencatat dan mengirim ke WA/PDF</small>
            </div>
            
            <div class="form-card" style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 20px;"><i class="fas fa-plus-circle"></i> Buat Catatan Baru</h4>
                
                <div class="input-group">
                    <label><i class="fas fa-tag"></i> Judul Catatan</label>
                    <input type="text" id="noteTitle" placeholder="Contoh: Rapat Evaluasi Bulanan November 2024">
                </div>
                
                <div class="input-group">
                    <label><i class="fas fa-align-left"></i> Isi Catatan</label>
                    <textarea id="noteContent" rows="6" placeholder="Tulis detail catatan rapat/evaluasi di sini..."></textarea>
                </div>
                
                <div class="input-group">
                    <label><i class="fas fa-users"></i> Daftar Peserta (pisahkan dengan koma)</label>
                    <input type="text" id="notePeserta" placeholder="Contoh: Agung Ubaidillah, Tasya Amelia Putri, Lidya Febrianti">
                    <small style="font-size: 11px; color: var(--gray); margin-top: 4px; display: block;">* Pisahkan setiap nama dengan tanda koma</small>
                </div>
                
                <div class="input-group">
                    <label><i class="fas fa-check-double"></i> Kesimpulan / Tindak Lanjut</label>
                    <textarea id="noteKesimpulan" rows="3" placeholder="Kesimpulan dan rencana tindak lanjut..."></textarea>
                </div>
                
                <div class="action-buttons" style="margin-top: 20px;">
                    <button class="action-btn btn-pdf" onclick="window.saveAndGenerateNotePDF()">
                        <i class="fas fa-file-pdf"></i> Simpan & Buat PDF
                    </button>
                    <button class="action-btn btn-whatsapp" onclick="window.saveAndSendNoteWA()">
                        <i class="fab fa-whatsapp"></i> Simpan & Kirim ke WA
                    </button>
                </div>
            </div>
            
            <div class="form-card">
                <div class="notes-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h4><i class="fas fa-history"></i> Riwayat Catatan</h4>
                    <button class="action-small" onclick="window.exportAllNotesToPDF()" style="background: var(--primary); color: white; padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-file-pdf"></i> Export Semua ke PDF
                    </button>
                </div>
                <div id="notesList" class="notes-list" style="max-height: 400px; overflow-y: auto;">
                    ${renderNotesList()}
                </div>
            </div>
        </div>
    `;
}

function saveAndGenerateNotePDF() {
  const title = document.getElementById("noteTitle")?.value.trim();
  const content = document.getElementById("noteContent")?.value.trim();
  const pesertaInput = document.getElementById("notePeserta")?.value.trim();
  const kesimpulan = document.getElementById("noteKesimpulan")?.value.trim();

  if (!title || !content) {
    if (window.Toast) {
      window.Toast.warning("Harap isi judul dan isi catatan!");
    } else {
      alert("Harap isi judul dan isi catatan!");
    }
    return;
  }

  const peserta = pesertaInput
    ? pesertaInput
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)
    : [];

  const newNote = {
    id: Date.now(),
    title: title,
    content: content,
    peserta: peserta,
    kesimpulan: kesimpulan,
    date: formatNoteDate(),
    timestamp: new Date().toISOString(),
  };

  NotesState.notes.push(newNote);
  saveNotes();
  generatePDFFromNote(newNote);
  renderNotesApp();

  // Reset form
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
  document.getElementById("notePeserta").value = "";
  document.getElementById("noteKesimpulan").value = "";
}

function saveAndSendNoteWA() {
  const title = document.getElementById("noteTitle")?.value.trim();
  const content = document.getElementById("noteContent")?.value.trim();
  const pesertaInput = document.getElementById("notePeserta")?.value.trim();
  const kesimpulan = document.getElementById("noteKesimpulan")?.value.trim();

  if (!title || !content) {
    if (window.Toast) {
      window.Toast.warning("Harap isi judul dan isi catatan!");
    } else {
      alert("Harap isi judul dan isi catatan!");
    }
    return;
  }

  const peserta = pesertaInput
    ? pesertaInput
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)
    : [];

  const newNote = {
    id: Date.now(),
    title: title,
    content: content,
    peserta: peserta,
    kesimpulan: kesimpulan,
    date: formatNoteDate(),
    timestamp: new Date().toISOString(),
  };

  NotesState.notes.push(newNote);
  saveNotes();
  sendNoteToWhatsApp(newNote);
  renderNotesApp();

  // Reset form
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
  document.getElementById("notePeserta").value = "";
  document.getElementById("noteKesimpulan").value = "";
}

function viewNoteDetail(id) {
  const note = NotesState.notes.find((n) => n.id === id);
  if (!note) return;

  const modal = document.createElement("div");
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        padding: 20px;
    `;

  modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--primary); margin: 0;"><i class="fas fa-file-alt"></i> ${escapeHtmlNotes(note.title)}</h2>
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: var(--gray);">&times;</button>
            </div>
            
            <div style="color: var(--gray); font-size: 12px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--gray-border);">
                <i class="far fa-calendar-alt"></i> ${note.date}
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong><i class="fas fa-align-left"></i> Isi Catatan:</strong>
                <div style="background: var(--gray-light); padding: 15px; border-radius: 10px; margin-top: 8px; white-space: pre-wrap; line-height: 1.6;">${escapeHtmlNotes(note.content)}</div>
            </div>
            
            ${
              note.peserta && note.peserta.length > 0
                ? `
            <div style="margin-bottom: 20px;">
                <strong><i class="fas fa-users"></i> Daftar Peserta (${note.peserta.length} orang):</strong>
                <div style="background: var(--gray-light); padding: 15px; border-radius: 10px; margin-top: 8px;">
                    ${note.peserta.map((p, i) => `${i + 1}. ${escapeHtmlNotes(p)}`).join("<br>")}
                </div>
            </div>
            `
                : ""
            }
            
            ${
              note.kesimpulan
                ? `
            <div style="margin-bottom: 20px;">
                <strong><i class="fas fa-check-double"></i> Kesimpulan / Tindak Lanjut:</strong>
                <div style="background: var(--gray-light); padding: 15px; border-radius: 10px; margin-top: 8px; white-space: pre-wrap; line-height: 1.6;">${escapeHtmlNotes(note.kesimpulan)}</div>
            </div>
            `
                : ""
            }
            
            <div style="display: flex; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--gray-border);">
                <button onclick="window.generatePDFFromNote(window.NotesState.notes.find(n => n.id === ${note.id})); this.closest('div').parentElement.remove();" style="flex:1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;"><i class="fas fa-file-pdf"></i> Download PDF</button>
                <button onclick="window.sendNoteToWhatsApp(window.NotesState.notes.find(n => n.id === ${note.id})); this.closest('div').parentElement.remove();" style="flex:1; padding: 12px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer;"><i class="fab fa-whatsapp"></i> Kirim ke WA</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
}

async function deleteNote(id) {
  const note = NotesState.notes.find((n) => n.id === id);

  // Gunakan confirm dialog jika ada, atau confirm biasa
  let confirmed = false;
  if (window.confirmDialog) {
    confirmed = await window.confirmDialog(
      `Apakah Anda yakin ingin menghapus catatan "${note?.title}"?`,
      "Hapus Catatan",
      "danger",
    );
  } else {
    confirmed = confirm(
      `Apakah Anda yakin ingin menghapus catatan "${note?.title}"?`,
    );
  }

  if (confirmed) {
    NotesState.notes = NotesState.notes.filter((n) => n.id !== id);
    saveNotes();
    renderNotesApp();

    if (window.Toast) {
      window.Toast.success("Catatan berhasil dihapus!");
    } else {
      alert("Catatan berhasil dihapus!");
    }
  }
}

function exportAllNotesToPDF() {
  if (NotesState.notes.length === 0) {
    if (window.Toast) {
      window.Toast.warning("Tidak ada catatan untuk diexport!");
    } else {
      alert("Tidak ada catatan untuk diexport!");
    }
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(67, 97, 238);
  doc.text("LAPORAN SEMUA CATATAN RAPAT", 105, 20, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(58, 12, 163);
  doc.text("IRMAS NURUL FALAH", 105, 28, { align: "center" });
  doc.setDrawColor(67, 97, 238);
  doc.line(20, 35, 190, 35);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Catatan: ${NotesState.notes.length}`, 105, 42, {
    align: "center",
  });
  doc.text(`Dicetak: ${formatNoteDate()}`, 105, 48, { align: "center" });

  let yPos = 60;

  NotesState.notes
    .slice()
    .reverse()
    .forEach((note, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${note.title}`, 20, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Tanggal: ${note.date}`, 25, yPos);
      yPos += 5;

      // Isi catatan (dibatasi)
      const contentPreview =
        note.content.length > 200
          ? note.content.substring(0, 200) + "..."
          : note.content;
      const contentLines = doc.splitTextToSize(contentPreview, 160);
      doc.text(contentLines, 25, yPos);
      yPos += contentLines.length * 5 + 5;

      if (note.peserta && note.peserta.length > 0) {
        doc.text(
          `Peserta: ${note.peserta.slice(0, 3).join(", ")}${note.peserta.length > 3 ? "..." : ""}`,
          25,
          yPos,
        );
        yPos += 5;
      }

      yPos += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;
    });

  // TTD untuk laporan semua catatan
  if (yPos > 240) {
    doc.addPage();
    yPos = 30;
  }

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Mengetahui,", 105, yPos, { align: "center" });
  yPos += 20;

  drawNoteTTD(doc, 30, yPos, "Tasya Amelia Putri", "Sekretaris 1");
  drawNoteTTD(doc, 110, yPos, "Lidya Febrianti", "Sekretaris 2");

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Dokumen ini digenerate otomatis oleh Sistem Absensi IRMAS",
    105,
    280,
    { align: "center" },
  );

  // Save PDF
  doc.save(`Laporan_Semua_Catatan_${new Date().getTime()}.pdf`);

  if (window.Toast) {
    window.Toast.success("Semua catatan berhasil diexport ke PDF!");
  } else {
    alert("Semua catatan berhasil diexport ke PDF!");
  }
}

function initNotesApp() {
  renderNotesApp();
}

// Expose NotesState ke window agar bisa diakses dari global
window.NotesState = NotesState;

// Make functions available globally
window.initNotesApp = initNotesApp;
window.saveAndGenerateNotePDF = saveAndGenerateNotePDF;
window.saveAndSendNoteWA = saveAndSendNoteWA;
window.viewNoteDetail = viewNoteDetail;
window.deleteNote = deleteNote;
window.exportAllNotesToPDF = exportAllNotesToPDF;
window.generatePDFFromNote = generatePDFFromNote;
window.sendNoteToWhatsApp = sendNoteToWhatsApp;
window.renderNotesApp = renderNotesApp;

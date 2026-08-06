/* =========================================================
   VERIFIKASI PENDAFTARAN OSIS — logika halaman admin
   ========================================================= */

const ADMIN_PASSWORD_HINT = "osistunas123"; // dicocokkan ulang di server (apps-script.gs)
const SESI_KEY = "osisAdminLoggedIn";

let SEMUA_DATA = {}; // { namaSheet: [ {ID, "Nama Lengkap", ...}, ... ] }

const elStatus = document.getElementById("status-muat");
const elDaftar = document.getElementById("daftar-jabatan");
const elCari = document.getElementById("cari-nama");

function isAdmin() {
  return !!sessionStorage.getItem(SESI_KEY);
}

function perbaruiTampilanAdmin() {
  const masuk = isAdmin();
  document.getElementById("admin-logged-out").style.display = masuk ? "none" : "";
  document.getElementById("admin-logged-in").style.display = masuk ? "" : "none";
}

document.getElementById("admin-login-btn").addEventListener("click", () => {
  const pass = document.getElementById("admin-pass").value;
  const msg = document.getElementById("admin-msg");
  if (pass === ADMIN_PASSWORD_HINT) {
    sessionStorage.setItem(SESI_KEY, pass);
    msg.textContent = "";
    document.getElementById("admin-pass").value = "";
    perbaruiTampilanAdmin();
  } else {
    msg.textContent = "Password salah.";
  }
});
document.getElementById("admin-logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem(SESI_KEY);
  perbaruiTampilanAdmin();
});
document.getElementById("admin-pass").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("admin-login-btn").click();
});

async function muatData() {
  const GAS_URL = window.GAS_URL;
  if (!GAS_URL || GAS_URL.includes("PASTE_URL")) {
    elStatus.textContent = "GAS_URL belum diisi di config.js — lihat PANDUAN-SETUP.md.";
    elStatus.classList.add("error");
    return;
  }
  elStatus.textContent = "Memuat data pendaftar...";
  elStatus.classList.remove("error");
  elDaftar.innerHTML = "";

  try {
    const res = await fetch(`${GAS_URL}?action=data`);
    const json = await res.json();
    if (json.status !== "ok") throw new Error(json.message || "Gagal memuat data");
    SEMUA_DATA = json.data || {};
    elStatus.textContent = "";
    renderDaftar(elCari.value.trim().toLowerCase());
  } catch (err) {
    elStatus.textContent = "Gagal memuat data: " + err.message + " (cek apakah GAS_URL sudah benar & deployment aktif)";
    elStatus.classList.add("error");
  }
}

function renderDaftar(filterNama) {
  elDaftar.innerHTML = "";
  const namaSheet = Object.keys(SEMUA_DATA);

  if (namaSheet.length === 0) {
    elDaftar.innerHTML = '<p class="jabatan-kosong">Belum ada data di Spreadsheet.</p>';
    return;
  }

  namaSheet.forEach((sheet) => {
    let rows = SEMUA_DATA[sheet] || [];
    if (filterNama) {
      rows = rows.filter((r) => String(r["Nama Lengkap"] || "").toLowerCase().includes(filterNama));
    }
    if (filterNama && rows.length === 0) return;

    const blok = document.createElement("div");
    blok.className = "jabatan-blok";
    blok.innerHTML = `<h2>${escapeHTML(sheet)} <span class="jml">${rows.length} pendaftar</span></h2>`;

    if (rows.length === 0) {
      blok.innerHTML += '<p class="jabatan-kosong">Belum ada pendaftar.</p>';
    } else {
      const grid = document.createElement("div");
      grid.className = "kandidat-grid";
      rows.forEach((r) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "kandidat-card";
        const foto = r["Link Foto"];
        card.innerHTML = `
          ${foto ? `<img class="foto" src="${escapeAttr(foto)}" alt="">` : `<div class="foto kosong">?</div>`}
          <div>
            <div class="nama">${escapeHTML(r["Nama Lengkap"] || "(tanpa nama)")}</div>
            <div class="sub">${escapeHTML(r["Kelas"] || "-")} · ${escapeHTML(r["Peran"] || sheet)}</div>
          </div>`;
        card.addEventListener("click", () => bukaModal(sheet, r));
        grid.appendChild(card);
      });
      blok.appendChild(grid);
    }

    elDaftar.appendChild(blok);
  });
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

/* ===== Modal detail ===== */
const modalOverlay = document.getElementById("modal-overlay");
const modalIsi = document.getElementById("modal-isi");

function bukaModal(sheet, r) {
  const namaLapor = encodeURIComponent(
    `Halo panitia, saya ingin melaporkan dugaan data palsu atas nama "${r["Nama Lengkap"] || "-"}" pada pendaftaran jabatan "${sheet}" (${r["Peran"] || sheet}).`
  );
  const linkWA = `https://wa.me/${window.NOMOR_LAPOR_WA}?text=${namaLapor}`;

  modalIsi.innerHTML = `
    <div class="detail-header">
      ${r["Link Foto"] ? `<img src="${escapeAttr(r["Link Foto"])}" alt="Pas foto">` : ""}
      <div>
        <h2>${escapeHTML(r["Nama Lengkap"] || "-")}</h2>
        <span class="peran-badge">${escapeHTML(r["Peran"] || sheet)}</span>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><label>Jabatan</label><div class="val">${escapeHTML(sheet)}</div></div>
      <div class="detail-item"><label>Kelas</label><div class="val">${escapeHTML(r["Kelas"] || "-")}</div></div>
      <div class="detail-item"><label>TTL</label><div class="val">${escapeHTML(r["TTL"] || "-")}</div></div>
      <div class="detail-item"><label>Agama</label><div class="val">${escapeHTML(r["Agama"] || "-")}</div></div>
      <div class="detail-item"><label>No HP</label><div class="val">${escapeHTML(r["No HP"] || "-")}</div></div>
      <div class="detail-item"><label>Email</label><div class="val">${escapeHTML(r["Email"] || "-")}</div></div>
      <div class="detail-item full"><label>Pengalaman Organisasi</label><div class="val">${escapeHTML(r["Pengalaman Organisasi"] || "(tidak diisi)")}</div></div>
      <div class="detail-item full"><label>Visi &amp; Misi</label><div class="val">${escapeHTML(r["Visi Misi"] || "-")}</div></div>
      <div class="detail-item full"><label>Alasan</label><div class="val">${escapeHTML(r["Alasan"] || "-")}</div></div>
      <div class="detail-item full"><label>Tujuan</label><div class="val">${escapeHTML(r["Tujuan"] || "-")}</div></div>
      <div class="detail-item full">
        <label>Tanda Tangan</label>
        ${r["Link TTD"] ? `<img class="detail-ttd" src="${escapeAttr(r["Link TTD"])}" alt="Tanda tangan">` : `<div class="val">(tidak ada)</div>`}
      </div>
      <div class="detail-item full"><label>Waktu Daftar</label><div class="val">${escapeHTML(r["Waktu Daftar"] || "-")}</div></div>
    </div>
    <div class="modal-aksi">
      <a class="btn-lapor" href="${linkWA}" target="_blank" rel="noopener">🚩 Lapor Data Palsu</a>
      ${isAdmin() ? `<button class="btn-hapus" id="btn-hapus-modal">🗑️ Hapus Data Ini</button>` : ""}
    </div>
  `;

  if (isAdmin()) {
    document.getElementById("btn-hapus-modal").addEventListener("click", () => hapusData(sheet, r["ID"], r["Nama Lengkap"]));
  }

  modalOverlay.classList.add("show");
}

document.getElementById("modal-close").addEventListener("click", () => modalOverlay.classList.remove("show"));
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove("show");
});

async function hapusData(sheet, id, nama) {
  if (!confirm(`Hapus data "${nama}" dari jabatan "${sheet}"? Tindakan ini tidak bisa dibatalkan.`)) return;

  const GAS_URL = window.GAS_URL;
  const payload = { action: "hapus", sheet, id, adminPass: sessionStorage.getItem(SESI_KEY) || "" };

  elStatus.textContent = "Menghapus data...";
  try {
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // fire-and-forget: kita tetap lanjut muat ulang untuk cek hasilnya
  }

  modalOverlay.classList.remove("show");
  setTimeout(muatData, 1400);
}

document.getElementById("btn-muat-ulang").addEventListener("click", muatData);
elCari.addEventListener("input", () => renderDaftar(elCari.value.trim().toLowerCase()));

perbaruiTampilanAdmin();
muatData();

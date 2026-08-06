/* =========================================================
   PENDAFTARAN OSIS — logika form pendaftaran
   Dipakai oleh semua halaman jabatan. Konfigurasi per-halaman
   lewat window.JABATAN (lihat contoh di tiap folder jabatan).

   window.JABATAN = {
     namaSheet: "SEKRETARIS 1",        // nama tab spreadsheet tujuan
     kodePrefix: "SEK1",               // dipakai untuk nomor tiket
     visiMisiBersama: false,           // true khusus Ketua & Wakil Ketua
     roles: [
       { peran: "SEKRETARIS 1", labelAlasan: "Alasan Masuk OSIS", labelTujuan: "Tujuan Masuk OSIS" }
     ]
   }
   ========================================================= */

const KELAS_OPSI = [
  { grup: "Kelas X", opsi: ["X TKR", "X MP", "X TKJ"] },
  { grup: "Kelas XI", opsi: ["XI TKR", "XI MP", "XI TKJ"] },
];

const AGAMA_OPSI = ["Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"];

function buatId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function opsiKelasHTML() {
  return KELAS_OPSI.map(
    (g) => `<optgroup label="${g.grup}">${g.opsi.map((o) => `<option value="${o}">${o}</option>`).join("")}</optgroup>`
  ).join("");
}
function opsiAgamaHTML() {
  return AGAMA_OPSI.map((a) => `<option value="${a}">${a}</option>`).join("");
}

/* Kompres & ubah file gambar jadi dataURL (biar payload ke Apps Script tidak kebesaran) */
function kompresGambar(file, maxLebar, kualitas) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("File bukan gambar yang valid"));
      img.onload = () => {
        const skala = Math.min(1, maxLebar / img.width);
        const w = Math.round(img.width * skala);
        const h = Math.round(img.height * skala);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", kualitas));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function templatePeranBlock(i, role, tampilkanLabel, visiMisiBersama) {
  const labelAlasan = role.labelAlasan || "Alasan Masuk OSIS";
  const labelTujuan = role.labelTujuan || "Tujuan Masuk OSIS";
  return `
  <div class="blok-peran" data-role-index="${i}">
    ${
      tampilkanLabel
        ? `<span class="label-peran"><span class="no">${i + 1}</span> ${role.peran}</span>`
        : ""
    }

    <div class="field">
      <label for="nama-r${i}">Nama Lengkap</label>
      <input type="text" id="nama-r${i}" required placeholder="Contoh: Budi Santoso">
    </div>

    <div class="field">
      <label for="ttl-r${i}">Tempat, Tanggal Lahir (TTL)</label>
      <input type="text" id="ttl-r${i}" required placeholder="Contoh: Tangerang, 14 Agustus 2008">
    </div>

    <div class="field">
      <label for="kelas-r${i}">Kelas</label>
      <select id="kelas-r${i}" required>
        <option value="" disabled selected>Pilih kelas</option>
        ${opsiKelasHTML()}
      </select>
    </div>

    <div class="field">
      <label for="agama-r${i}">Agama</label>
      <select id="agama-r${i}" required>
        <option value="" disabled selected>Pilih agama</option>
        ${opsiAgamaHTML()}
      </select>
    </div>

    <div class="field">
      <label for="hp-r${i}">No. HP / WhatsApp</label>
      <input type="tel" id="hp-r${i}" required placeholder="08xxxxxxxxxx">
    </div>

    <div class="field">
      <label for="email-r${i}">Email</label>
      <input type="email" id="email-r${i}" required placeholder="nama@email.com">
    </div>

    <div class="field">
      <label for="pengalaman-r${i}">Pengalaman Organisasi <span class="ket">(opsional)</span></label>
      <textarea id="pengalaman-r${i}" placeholder="Contoh: Anggota Pramuka, Panitia MPLS, dll (boleh dikosongkan)"></textarea>
    </div>

    ${
      visiMisiBersama
        ? ""
        : `<div class="field">
      <label for="visi-misi-r${i}">Visi &amp; Misi</label>
      <textarea id="visi-misi-r${i}" required placeholder="Tuliskan visi dan misi kamu"></textarea>
    </div>`
    }

    <div class="field">
      <label for="alasan-r${i}">${labelAlasan}</label>
      <textarea id="alasan-r${i}" required placeholder="Tuliskan alasan kamu"></textarea>
    </div>

    <div class="field">
      <label for="tujuan-r${i}">${labelTujuan}</label>
      <textarea id="tujuan-r${i}" required placeholder="Tuliskan tujuan kamu"></textarea>
    </div>

    <div class="field">
      <label>Pas Foto 3x4</label>
      <div class="upload-box">
        <a href="../aset/contohfoto.jpg" target="_blank" rel="noopener" class="contoh-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 4h16v16H4z"/><path d="M8 12l3 3 5-6"/></svg>
          Lihat contoh foto
        </a>
        <div class="ket" style="margin-bottom:8px">Wajib formal, latar putih/abu, pakai seragam SMK.</div>
        <div class="upload-tombol">
          <label>📁 Upload File<input type="file" accept="image/*" id="foto-file-r${i}"></label>
          <label>📷 Ambil dari Kamera<input type="file" accept="image/*" capture="environment" id="foto-camera-r${i}"></label>
        </div>
        <div class="preview-wrap" id="foto-preview-wrap-r${i}">
          <img id="foto-preview-img-r${i}" alt="Preview pas foto">
          <div style="flex:1">
            <div class="nama-file" id="foto-nama-file-r${i}"></div>
            <button type="button" class="hapus-file" data-hapus-foto="${i}">Hapus &amp; pilih ulang</button>
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <label>Tanda Tangan</label>
      <div class="upload-box">
        <a href="../aset/contohttd.jpg" target="_blank" rel="noopener" class="contoh-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 4h16v16H4z"/><path d="M8 12l3 3 5-6"/></svg>
          Lihat contoh tanda tangan
        </a>
        <div class="ket" style="margin-bottom:8px">Tanda tangan di atas kertas putih polos, foto/scan yang jelas.</div>
        <div class="upload-tombol">
          <label>📁 Upload File<input type="file" accept="image/*" id="ttd-file-r${i}"></label>
          <label>📷 Ambil dari Kamera<input type="file" accept="image/*" capture="environment" id="ttd-camera-r${i}"></label>
        </div>
        <div class="preview-wrap" id="ttd-preview-wrap-r${i}">
          <img id="ttd-preview-img-r${i}" alt="Preview tanda tangan">
          <div style="flex:1">
            <div class="nama-file" id="ttd-nama-file-r${i}"></div>
            <button type="button" class="hapus-file" data-hapus-ttd="${i}">Hapus &amp; pilih ulang</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.JABATAN;
  if (!cfg) return;

  const container = document.getElementById("peran-container");
  const tampilkanLabel = cfg.roles.length > 1;
  container.innerHTML = cfg.roles
    .map((role, i) => templatePeranBlock(i, role, tampilkanLabel, !!cfg.visiMisiBersama))
    .join("");

  if (cfg.visiMisiBersama) {
    document.getElementById("visi-bersama-field").style.display = "";
  }

  // state file per index
  const fileState = {}; // { [i]: { fotoDataUrl, fotoNama, ttdDataUrl, ttdNama } }
  cfg.roles.forEach((_, i) => (fileState[i] = {}));

  function pasangUploadListener(jenis, i, maxLebar, kualitas) {
    const inputFile = document.getElementById(`${jenis}-file-r${i}`);
    const inputCamera = document.getElementById(`${jenis}-camera-r${i}`);
    const previewWrap = document.getElementById(`${jenis}-preview-wrap-r${i}`);
    const previewImg = document.getElementById(`${jenis}-preview-img-r${i}`);
    const namaFileEl = document.getElementById(`${jenis}-nama-file-r${i}`);

    async function tangani(file) {
      if (!file) return;
      try {
        const dataUrl = await kompresGambar(file, maxLebar, kualitas);
        fileState[i][`${jenis}DataUrl`] = dataUrl;
        fileState[i][`${jenis}Nama`] = file.name;
        previewImg.src = dataUrl;
        namaFileEl.textContent = file.name;
        previewWrap.classList.add("show");
      } catch (err) {
        alert("Gagal memproses gambar: " + err.message);
      }
    }

    inputFile.addEventListener("change", (e) => tangani(e.target.files[0]));
    inputCamera.addEventListener("change", (e) => tangani(e.target.files[0]));
  }

  cfg.roles.forEach((_, i) => {
    pasangUploadListener("foto", i, 900, 0.72);
    pasangUploadListener("ttd", i, 900, 0.75);
  });

  container.addEventListener("click", (e) => {
    const hapusFoto = e.target.getAttribute("data-hapus-foto");
    const hapusTtd = e.target.getAttribute("data-hapus-ttd");
    if (hapusFoto !== null) {
      fileState[hapusFoto].fotoDataUrl = null;
      fileState[hapusFoto].fotoNama = null;
      document.getElementById(`foto-preview-wrap-r${hapusFoto}`).classList.remove("show");
      document.getElementById(`foto-file-r${hapusFoto}`).value = "";
      document.getElementById(`foto-camera-r${hapusFoto}`).value = "";
    }
    if (hapusTtd !== null) {
      fileState[hapusTtd].ttdDataUrl = null;
      fileState[hapusTtd].ttdNama = null;
      document.getElementById(`ttd-preview-wrap-r${hapusTtd}`).classList.remove("show");
      document.getElementById(`ttd-file-r${hapusTtd}`).value = "";
      document.getElementById(`ttd-camera-r${hapusTtd}`).value = "";
    }
  });

  const form = document.getElementById("form-pendaftaran");
  const submitBtn = document.getElementById("submit-btn");
  const formMsg = document.getElementById("form-msg");
  const suksesBox = document.getElementById("sukses");
  const kodeTiketEl = document.getElementById("kode-tiket");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMsg.classList.remove("show", "error");

    // validasi foto & ttd wajib ada (input teks lain sudah divalidasi HTML5 "required")
    for (let i = 0; i < cfg.roles.length; i++) {
      if (!fileState[i].fotoDataUrl) {
        formMsg.textContent = `Pas foto untuk ${tampilkanLabel ? cfg.roles[i].peran : "peserta"} wajib diunggah.`;
        formMsg.classList.add("show", "error");
        return;
      }
      if (!fileState[i].ttdDataUrl) {
        formMsg.textContent = `Tanda tangan untuk ${tampilkanLabel ? cfg.roles[i].peran : "peserta"} wajib diunggah.`;
        formMsg.classList.add("show", "error");
        return;
      }
    }

    const visiMisiBersamaVal = cfg.visiMisiBersama
      ? document.getElementById("visi-misi-bersama").value.trim()
      : "";
    if (cfg.visiMisiBersama && !visiMisiBersamaVal) {
      formMsg.textContent = "Visi & Misi wajib diisi.";
      formMsg.classList.add("show", "error");
      return;
    }

    const kodePasangan = cfg.roles.length > 1 ? buatId() : "";

    const items = cfg.roles.map((role, i) => ({
      id: buatId(),
      kodePasangan,
      peran: role.peran,
      namaLengkap: document.getElementById(`nama-r${i}`).value.trim(),
      ttl: document.getElementById(`ttl-r${i}`).value.trim(),
      kelas: document.getElementById(`kelas-r${i}`).value,
      agama: document.getElementById(`agama-r${i}`).value,
      hp: document.getElementById(`hp-r${i}`).value.trim(),
      email: document.getElementById(`email-r${i}`).value.trim(),
      pengalaman: document.getElementById(`pengalaman-r${i}`).value.trim(),
      visiMisi: cfg.visiMisiBersama
        ? visiMisiBersamaVal
        : document.getElementById(`visi-misi-r${i}`).value.trim(),
      alasan: document.getElementById(`alasan-r${i}`).value.trim(),
      tujuan: document.getElementById(`tujuan-r${i}`).value.trim(),
      fotoDataUrl: fileState[i].fotoDataUrl,
      fotoNama: fileState[i].fotoNama,
      ttdDataUrl: fileState[i].ttdDataUrl,
      ttdNama: fileState[i].ttdNama,
    }));

    const payload = {
      action: "daftar",
      jabatan: cfg.namaSheet,
      items,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";

    const GAS_URL = window.GAS_URL;
    const belumDikonfigurasi = !GAS_URL || GAS_URL.includes("PASTE_URL");

    try {
      if (!belumDikonfigurasi) {
        await fetch(GAS_URL, {
          method: "POST",
          mode: "no-cors", // GAS tidak mengirim header CORS; kirim "fire and forget"
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      }

      form.style.display = "none";
      const kode = `${cfg.kodePrefix || "OSIS"}-${Math.floor(1000 + Math.random() * 9000)}`;
      kodeTiketEl.textContent = kode;
      suksesBox.classList.add("show");

      if (belumDikonfigurasi) {
        console.warn("GAS_URL belum diisi di config.js — data belum benar-benar tersimpan ke Spreadsheet. Lihat PANDUAN-SETUP.md");
      }
    } catch (err) {
      formMsg.textContent = "Gagal mengirim pendaftaran. Periksa koneksi internet, lalu coba lagi.";
      formMsg.classList.add("show", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Daftar Sekarang";
    }
  });
});

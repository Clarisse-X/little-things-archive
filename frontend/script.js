const API_URL = "/api/memories";

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const memoryForm = document.getElementById("memoryForm");
const successMessage = document.getElementById("successMessage");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
let editingId = null;

const validCategories = ["self-love", "friendship", "achievement", "family", "random happiness"];

// ---------- Tampilkan galeri dari API ----------

function showMessage(text) {
  gallery.innerHTML = "";
  const p = document.createElement("p");
  p.className = "empty";
  p.textContent = text;
  gallery.appendChild(p);
}

function renderCard(memory) {
  const card = document.createElement("div");
  card.className = "card";

  const category = document.createElement("span");
  category.className = "category";
  category.textContent = memory.category;

  const title = document.createElement("h2");
  title.textContent = memory.title;

  const date = document.createElement("p");
  date.className = "date";
  date.textContent = memory.memory_date;

  const happiness = document.createElement("p");
  happiness.className = "happiness";
  happiness.textContent = "😊".repeat(memory.happiness_level);

    const actions = document.createElement("div");
  actions.className = "card-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn-edit";
  editBtn.textContent = "Edit";

        editBtn.addEventListener("click", function () {
    askPin(function () { startEdit(memory); });
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-delete";
  deleteBtn.textContent = "Hapus";
    deleteBtn.addEventListener("click", function () {
    askPin(function () { deleteMemory(memory); });
  });

    const readBtn = document.createElement("button");
  readBtn.className = "btn-read";
  readBtn.textContent = "Baca";
  readBtn.addEventListener("click", function () {
    openStory(memory);
  });

  actions.append(readBtn, editBtn, deleteBtn);

  card.append(category, title, date, happiness, actions);
  gallery.appendChild(card);
}

const storyModal = document.getElementById("storyModal");

function openStory(memory) {
  document.getElementById("modalCategory").textContent = memory.category;
  document.getElementById("modalTitle").textContent = memory.title;
  document.getElementById("modalDate").textContent = memory.memory_date;
  document.getElementById("modalStory").textContent = memory.story;
  document.getElementById("modalHappiness").textContent = "😊".repeat(memory.happiness_level);
  storyModal.style.display = "flex";
}

function closeStory() {
  storyModal.style.display = "none";
}

document.getElementById("closeModal").addEventListener("click", closeStory);
storyModal.addEventListener("click", function (event) {
  if (event.target === storyModal) closeStory();
});

const pinModal = document.getElementById("pinModal");
const pinInput = document.getElementById("pinInput");
const pinMessage = document.getElementById("pinMessage");
let pendingAction = null;
let adminPin = "";

function askPin(action) {
  pendingAction = action;
  pinInput.value = "";
  pinMessage.textContent = "";
  pinMessage.className = "error";
  pinModal.style.display = "flex";
  pinInput.focus();
}

function closePin() {
  pinModal.style.display = "none";
  pendingAction = null;
}

async function submitPin() {
  const pin = pinInput.value.trim();
  pinMessage.className = "error";

  if (pin === "") {
    pinMessage.textContent = "PIN wajib diisi";
    return;
  }

  try {
    const response = await fetch("/api/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pin })
    });

    if (response.status === 401 || response.status === 403) {
      pinMessage.textContent = "PIN salah, coba lagi";
      pinInput.value = "";
      return;
    }
    if (!response.ok) {
      pinMessage.textContent = "Gagal memeriksa PIN (kode " + response.status + ")";
      return;
    }

    adminPin = pin;
    pinMessage.className = "success";
    pinMessage.textContent = "PIN benar";

    const action = pendingAction;
    setTimeout(function () {
      closePin();
      if (action) action();
    }, 600);
  } catch (error) {
    pinMessage.textContent = "Tidak bisa terhubung ke server.";
  }
}

document.getElementById("pinSubmit").addEventListener("click", submitPin);
document.getElementById("closePin").addEventListener("click", closePin);
pinInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") submitPin();
});
pinModal.addEventListener("click", function (event) {
  if (event.target === pinModal) closePin();
});

function startEdit(memory) {
  editingId = memory.id;
  clearErrors();

  document.getElementById("title").value = memory.title;
  document.getElementById("story").value = memory.story;
  document.getElementById("memory_date").value = memory.memory_date;
  document.getElementById("category").value = memory.category;
  document.getElementById("happiness_level").value = memory.happiness_level;

  submitBtn.textContent = "Simpan Perubahan";
  cancelEditBtn.style.display = "block";
  memoryForm.scrollIntoView({ behavior: "smooth" });
}

function stopEdit() {
  editingId = null;
  adminPin = "";
  memoryForm.reset();
  submitBtn.textContent = "Simpan Kenangan";
  cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", function () {
  stopEdit();
  clearErrors();
});

async function deleteMemory(memory) {
  const sure = confirm('Yakin mau menghapus kenangan "' + memory.title + '"?');
  if (!sure) return;

  try {
        const response = await fetch(API_URL + "/" + memory.id, {
      method: "DELETE",
      headers: { "X-Admin-PIN": adminPin }
    });
    adminPin = "";

    if (response.status === 401 || response.status === 403) {
      alert("PIN salah atau kedaluwarsa. Klik Hapus lagi.");
      return;
    }

    if (!response.ok) {
      alert("Gagal menghapus kenangan (kode " + response.status + ").");
      return;
    }

    loadMemories();
  } catch (error) {
    alert("Tidak bisa terhubung ke server. Pastikan backend sudah jalan.");
  }
}

async function loadMemories() {
  const params = new URLSearchParams();
  const keyword = searchInput.value.trim();
  const category = categoryFilter.value;

  if (keyword !== "") params.set("search", keyword);
  if (category !== "") params.set("category", category);

  const query = params.toString();
  const url = query ? API_URL + "?" + query : API_URL;

  showMessage("Memuat kenangan...");

  try {
    const response = await fetch(url);
    if (!response.ok) {
      showMessage("Gagal memuat kenangan (kode " + response.status + ").");
      return;
    }

    const memories = await response.json();

    if (memories.length === 0) {
      showMessage("Belum ada kenangan yang cocok.");
      return;
    }

    gallery.innerHTML = "";
    memories.forEach(renderCard);
  } catch (error) {
    showMessage("Tidak bisa terhubung ke server. Pastikan backend sudah jalan.");
  }
}

searchInput.addEventListener("input", loadMemories);
categoryFilter.addEventListener("change", loadMemories);

// ---------- Form tambah kenangan ----------

function clearErrors() {
  document.querySelectorAll(".error").forEach(function (el) {
    el.textContent = "";
  });
  successMessage.textContent = "";
}

memoryForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearErrors();

  const title = document.getElementById("title").value.trim();
  const story = document.getElementById("story").value.trim();
  const memoryDate = document.getElementById("memory_date").value;
  const category = document.getElementById("category").value;
  const happiness = Number(document.getElementById("happiness_level").value);

  // Cek cepat di browser (backend tetap yang menentukan)
  let valid = true;

  if (title === "") {
    document.getElementById("error-title").textContent = "Judul wajib diisi";
    valid = false;
  }
  if (story === "") {
    document.getElementById("error-story").textContent = "Cerita wajib diisi";
    valid = false;
  }
  if (memoryDate === "") {
    document.getElementById("error-memory_date").textContent = "Tanggal wajib diisi";
    valid = false;
  }
  if (!validCategories.includes(category)) {
    document.getElementById("error-category").textContent = "Pilih salah satu kategori";
    valid = false;
  }
  if (!Number.isInteger(happiness) || happiness < 1 || happiness > 5) {
    document.getElementById("error-happiness_level").textContent = "Harus angka 1 sampai 5";
    valid = false;
  }

  if (!valid) return;

  // Kirim ke API
  try {
        const isEditing = editingId !== null;
    const url = isEditing ? API_URL + "/" + editingId : API_URL;

    const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
      headers: isEditing
        ? { "Content-Type": "application/json", "X-Admin-PIN": adminPin }
        : { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        story: story,
        memory_date: memoryDate,
        category: category,
        happiness_level: happiness
      })
    });

    const result = await response.json();

        if (response.status === 401 || response.status === 403) {
      stopEdit();
      document.getElementById("error-title").textContent =
        "PIN salah atau kedaluwarsa. Klik Edit lagi.";
      return;
    }

    if (response.status === 400 && result.details) {
      // Tampilkan pesan error dari backend di bawah input yang sesuai
      Object.keys(result.details).forEach(function (field) {
        const el = document.getElementById("error-" + field);
        if (el) el.textContent = result.details[field];
      });
      return;
    }

    if (!response.ok) {
      successMessage.textContent = "";
      document.getElementById("error-title").textContent =
        result.error || "Terjadi kesalahan di server.";
      return;
    }

        const wasEditing = editingId !== null;
    stopEdit();
    successMessage.textContent = wasEditing
      ? "Perubahan berhasil disimpan!"
      : "Kenangan berhasil disimpan!";
    loadMemories();
  } catch (error) {
    document.getElementById("error-title").textContent =
      "Tidak bisa terhubung ke server. Pastikan backend sudah jalan.";
  }
});

loadMemories();
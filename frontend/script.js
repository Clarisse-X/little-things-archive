const memories = [
  {
    id: 1,
    title: "Finally survived presentation day!",
    story: "Presentasi kelompok akhirnya selesai dengan lancar.",
    memory_date: "2026-10-18",
    category: "Achievement",
    happiness_level: 5
  },
  {
    id: 2,
    title: "Makan mie ayam favorit",
    story: "Pulang kuliah capek, ditraktir mie ayam sama teman.",
    memory_date: "2026-10-15",
    category: "Friendship",
    happiness_level: 4
  },
  {
    id: 3,
    title: "Langit sore yang cantik",
    story: "Lihat langit oranye pas pulang kuliah.",
    memory_date: "2026-10-12",
    category: "Random Happiness",
    happiness_level: 3
  }
];

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function showMemories() {
  gallery.innerHTML = "";

  const keyword = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = memories.filter(function (memory) {
    const matchTitle = memory.title.toLowerCase().includes(keyword);
    const matchCategory = category === "" || memory.category === category;
    return matchTitle && matchCategory;
  });

  if (filtered.length === 0) {
    gallery.innerHTML = '<p class="empty">Belum ada kenangan yang cocok.</p>';
    return;
  }

  filtered.forEach(function (memory) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML =
      '<span class="category">' + memory.category + "</span>" +
      "<h2>" + memory.title + "</h2>" +
      '<p class="date">' + memory.memory_date + "</p>" +
      '<p class="happiness">' + "😊".repeat(memory.happiness_level) + "</p>";

    gallery.appendChild(card);
  });
}

searchInput.addEventListener("input", showMemories);
categoryFilter.addEventListener("change", showMemories);

showMemories();

const memoryForm = document.getElementById("memoryForm");
const successMessage = document.getElementById("successMessage");

const validCategories = ["Self-love", "Friendship", "Achievement", "Family", "Random Happiness"];

function clearErrors() {
  document.querySelectorAll(".error").forEach(function (el) {
    el.textContent = "";
  });
  successMessage.textContent = "";
}

memoryForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearErrors();

  const title = document.getElementById("title").value.trim();
  const story = document.getElementById("story").value.trim();
  const memoryDate = document.getElementById("memory_date").value;
  const category = document.getElementById("category").value;
  const happiness = Number(document.getElementById("happiness_level").value);

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

  if (!valid) {
    return;
  }

  memories.unshift({
    id: Date.now(),
    title: title,
    story: story,
    memory_date: memoryDate,
    category: category,
    happiness_level: happiness
  });

  showMemories();
  memoryForm.reset();
  successMessage.textContent = "Kenangan berhasil disimpan!";
});
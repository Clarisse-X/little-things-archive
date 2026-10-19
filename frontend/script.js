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

function showMemories() {
  gallery.innerHTML = "";

  memories.forEach(function (memory) {
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

showMemories();
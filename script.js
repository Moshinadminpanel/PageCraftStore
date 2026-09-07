/*
 * Bindery & Co. — catalog data and Express backend Stripe integration
 */

const BACKEND_URL = "https://pagecraftstore.onrender.com";

const BOOKS = [
  {
    number: "041",
    title: "Beyond the Lens",
    author: "Elena Marsh",
    category: "fiction",
    price: 69.50,
    color: "#7A2E22",
    blurb: "A woman inherits her grandmother's apartment and, one drawer at a time, the life she never asked about. Quiet, exact, and quietly devastating."
  },
  {
    number: "042",
    title: "Marginalia",
    author: "Tomas Aguirre",
    category: "nonfiction",
    price: 69.50,
    color: "#2E4057",
    blurb: "Sixteen essays written in the margins of other people's books — on reading, grief, and the habit of writing back to the dead."
  },
  {
    number: "043",
    title: "Salt for the Absent",
    author: "Noor Kassab",
    category: "poetry",
    price: 19.00,
    color: "#5C4A72",
    blurb: "A debut collection about leaving a coastal town, and the language you keep speaking to no one in particular."
  },
  {
    number: "044",
    title: "The Cartographer's Daughter",
    author: "Wren Halloway",
    category: "fiction",
    price: 19.00,
    color: "#4B5A40",
    blurb: "A mapmaker's daughter redraws her father's unfinished atlas of a country that no longer exists on paper, or otherwise."
  },
  {
    number: "045",
    title: "Nine Winters in Odessa",
    author: "Katarina Volkov, translated by Marina Belova",
    category: "translated",
    price: 20.00,
    color: "#4B5A40",
    blurb: "Nine linked stories set across nine winters in one apartment building, translated into English for the first time."
  },
  {
    number: "046",
    title: "A Field Guide to Leaving",
    author: "Priya Ondaatje",
    category: "nonfiction",
    price: 17.50,
    color: "#2E4057",
    blurb: "Part memoir, part actual field guide — chapters organized by the birds the author saw on the day of each departure."
  },
  {
    number: "047",
    title: "The Quiet Machinery",
    author: "Julian Ferro",
    category: "fiction",
    price: 18.50,
    color: "#7A2E22",
    blurb: "A night-shift engineer at a shuttered textile mill discovers the looms still running, and no one willing to explain why."
  },
  {
    number: "048",
    title: "Sparrow Arithmetic",
    author: "Ines Duarte",
    category: "poetry",
    price: 13.50,
    color: "#5C4A72",
    blurb: "Short, exact poems that count what's left after a divorce: dishes, weekends, birds at the feeder."
  },
  {
    number: "049",
    title: "Letters to No One in Particular",
    author: "Marcus Webb",
    category: "nonfiction",
    price: 16.00,
    color: "#1A1815",
    blurb: "Unsent letters to teachers, exes, and strangers on trains, collected as a strange and generous kind of correspondence course."
  },
  {
    number: "050",
    title: "The Lighthouse Keeps No Secrets",
    author: "Delphine Roux, translated by Anne Castellane",
    category: "translated",
    price: 19.50,
    color: "#1A1815",
    blurb: "A retiring lighthouse keeper hands over her logbooks, and with them, forty years of ships she never reported."
  }
];

const CATEGORY_LABEL = {
  fiction: "Fiction",
  nonfiction: "Nonfiction",
  poetry: "Poetry",
  translated: "Translated"
};

const TILTS = [-1, 0.6, -0.4, 1, -0.8, 0.5, -0.6, 0.8, -0.3, 0.4];

const grid = document.getElementById("grid");
const filterButtons = document.querySelectorAll(".filter-pill");

function formatPrice(n){
  return "$" + n.toFixed(2);
}

function renderGrid(){
  if (!grid) return;
  grid.innerHTML = BOOKS.map((book, i) => `
    <article class="card" data-category="${book.category}" style="transform: rotate(${TILTS[i % TILTS.length]}deg);">
      <p class="card-number">No. ${book.number}</p>
      <div class="card-cover" style="background:${book.color};" data-index="${i}" tabindex="0" role="button" aria-label="View details for ${book.title}">
        <span class="cover-title">${book.title}</span>
      </div>
      <span class="card-tag" style="background:${book.color};">${CATEGORY_LABEL[book.category]}</span>
      <h3 class="card-title" data-index="${i}">${book.title}</h3>
      <p class="card-author">${book.author}</p>
      <p class="card-teaser">${book.blurb}</p>
      <div class="card-footer">
        <span class="card-price">${formatPrice(book.price)}</span>
        <button class="btn btn-primary card-buy" type="button" data-index="${i}">Buy</button>
      </div>
    </article>
  `).join("");
}

function applyFilter(category){
  document.querySelectorAll(".card").forEach(card => {
    const match = category === "all" || card.dataset.category === category;
    card.classList.toggle("is-hidden", !match);
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed", "true");
    applyFilter(btn.dataset.filter);
  });
});

let toastTimer = null;
function showToast(message){
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3800);
}

// Calls your Node.js backend on Port 4242
async function checkout(book) {
  showToast("Connecting to payment server...");

  try {
    const response = await fetch(`${BACKEND_URL}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: book.title,
        price: book.price,
        number: book.number
      }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      showToast(data.error || "Could not create checkout session.");
    }
  } catch (err) {
    console.error("Server Error:", err);
    showToast("Failed to connect to backend server on port 4242.");
  }
};

grid.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card-cover")) {
    e.preventDefault();
    openModal(Number(e.target.dataset.index));
  }
});

// ---------- Modal ----------
const modal = document.getElementById("modal");
let lastFocused = null;

function openModal(index){
  const book = BOOKS[index];
  document.getElementById("modal-cover").style.background = book.color;
  document.getElementById("modal-number").textContent = "No. " + book.number + " — " + CATEGORY_LABEL[book.category];
  document.getElementById("modal-title").textContent = book.title;
  document.getElementById("modal-author").textContent = book.author;
  document.getElementById("modal-blurb").textContent = book.blurb;
  document.getElementById("modal-price").textContent = formatPrice(book.price);

  const buyBtn = document.getElementById("modal-buy");
  buyBtn.onclick = () => {
    checkout(book);
  };

  lastFocused = document.activeElement;
  modal.hidden = false;
  modal.querySelector(".modal-close").focus();
  document.body.style.overflow = "hidden";
}

function closeModal(){
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

// Initial render
renderGrid();
applyFilter("all");

// Listen for clicks on the Buy buttons generated in the grid
grid.addEventListener("click", (e) => {
  if (e.target.classList.contains("card-buy")) {
    const index = e.target.dataset.index;
    checkout(BOOKS[index]);
  }
});

// Reveal PDF download if returning from a successful payment
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true') {
  showToast("Payment successful! You can now download your book.");
  const downloadSection = document.getElementById('pdf-download-section');
  if (downloadSection) downloadSection.hidden = false;
}
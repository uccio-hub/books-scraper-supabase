const PAGE_SIZE = 24;
const config = window.BOOK_APP_CONFIG || {};
const isConfigured = /^https:\/\/.+\.supabase\.co$/.test(config.supabaseUrl || "")
  && /^sb_publishable_/.test(config.supabasePublishableKey || "");
const client = isConfigured ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey) : null;

const state = { page: 1, total: 0, savedOnly: false, searchTimer: null };
const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function getSaved() {
  try { return JSON.parse(localStorage.getItem("leaf-letter-saved")) || []; }
  catch { return []; }
}

function setSaved(ids) {
  localStorage.setItem("leaf-letter-saved", JSON.stringify(ids));
  $("savedCount").textContent = ids.length;
}

function stars(rating) {
  const value = Number(rating) || 0;
  return `<span class="stars" aria-label="${value} out of 5 stars">${"★".repeat(value)}${"☆".repeat(5 - value)}</span>`;
}

function renderSkeletons() {
  $("skeletonGrid").innerHTML = Array.from({ length: 8 }, () => `
    <div class="skeleton-card"><div></div><i></i><i></i><i></i></div>`).join("");
  $("skeletonGrid").classList.remove("hidden");
  $("bookGrid").classList.add("hidden");
}

function hideSkeletons() {
  $("skeletonGrid").classList.add("hidden");
  $("bookGrid").classList.remove("hidden");
}

function bookCard(book) {
  const saved = getSaved().includes(book.book_id);
  return `
    <article class="book-card" data-id="${escapeHtml(book.book_id)}">
      <button class="save-book ${saved ? "saved" : ""}" type="button" aria-label="${saved ? "Remove from" : "Add to"} saved books">${saved ? "♥" : "♡"}</button>
      <button class="book-open" type="button" aria-label="View ${escapeHtml(book.title)}">
        <div class="cover-wrap"><img src="${escapeHtml(book.image_url)}" alt="Cover of ${escapeHtml(book.title)}" loading="lazy"></div>
        <div class="book-meta"><span>${escapeHtml(book.category)}</span>${stars(book.rating)}</div>
        <h3>${escapeHtml(book.title)}</h3>
        <div class="book-bottom"><strong>£${Number(book.price_gbp).toFixed(2)}</strong><span>${book.stock_quantity > 0 ? "In stock" : "Unavailable"}</span></div>
      </button>
    </article>`;
}

function sortSettings() {
  const [column, direction] = $("sortFilter").value.split("-");
  const columns = { title: "title", price: "price_gbp", rating: "rating" };
  return { column: columns[column] || "title", ascending: direction === "asc" };
}

async function loadCategories() {
  const { data, error } = await client.from("books").select("category").limit(1000);
  if (error) throw error;
  const categories = [...new Set(data.map((row) => row.category).filter(Boolean))].sort();
  $("categoryFilter").insertAdjacentHTML("beforeend", categories.map((category) =>
    `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join(""));
}

async function loadBooks() {
  if (!client) {
    $("setupNotice").classList.remove("hidden");
    $("resultCount").textContent = "Configuration required";
    return;
  }
  renderSkeletons();
  $("errorNotice").classList.add("hidden");
  const from = (state.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { column, ascending } = sortSettings();
  let query = client.from("books").select("*", { count: "exact" });
  const search = $("searchInput").value.trim();
  const category = $("categoryFilter").value;
  const minimumRating = $("ratingFilter").value;
  if (search) query = query.ilike("title", `%${search.replace(/[%_]/g, "")}%`);
  if (category) query = query.eq("category", category);
  if (minimumRating) query = query.gte("rating", Number(minimumRating));
  const saved = getSaved();
  if (state.savedOnly) {
    if (!saved.length) {
      state.total = 0;
      renderBooks([]);
      return;
    }
    query = query.in("book_id", saved);
  }
  const { data, error, count } = await query.order(column, { ascending }).range(from, to);
  if (error) {
    hideSkeletons();
    $("errorNotice").textContent = `The catalogue could not be loaded: ${error.message}`;
    $("errorNotice").classList.remove("hidden");
    $("resultCount").textContent = "Unable to load books";
    return;
  }
  state.total = count || 0;
  renderBooks(data || []);
}

function renderBooks(books) {
  hideSkeletons();
  $("bookGrid").innerHTML = books.length ? books.map(bookCard).join("") : `
    <div class="empty-state"><strong>No books found</strong><p>Try changing your search or filters.</p></div>`;
  $("resultCount").textContent = `${state.total.toLocaleString()} ${state.total === 1 ? "book" : "books"}`;
  const pages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  $("pageInfo").textContent = `Page ${state.page} of ${pages}`;
  $("previousPage").disabled = state.page <= 1;
  $("nextPage").disabled = state.page >= pages;
  $("pagination").classList.toggle("hidden", state.total <= PAGE_SIZE);
}

async function openBook(bookId) {
  const { data, error } = await client.from("books").select("*").eq("book_id", bookId).single();
  if (error) return;
  $("dialogContent").innerHTML = `
    <div class="dialog-layout">
      <div class="dialog-cover"><img src="${escapeHtml(data.image_url)}" alt="Cover of ${escapeHtml(data.title)}"></div>
      <div class="dialog-copy">
        <p class="eyebrow">${escapeHtml(data.category)}</p>
        <h2>${escapeHtml(data.title)}</h2>
        ${stars(data.rating)}
        <strong class="dialog-price">£${Number(data.price_gbp).toFixed(2)}</strong>
        <p>${escapeHtml(data.description || "No description is available for this title.")}</p>
        <div class="dialog-facts"><span>${escapeHtml(data.availability)}</span><span>${data.review_count || 0} reviews</span></div>
        <a href="${escapeHtml(data.product_url)}" target="_blank" rel="noopener">View original listing ↗</a>
      </div>
    </div>`;
  $("bookDialog").showModal();
}

function resetAndLoad() { state.page = 1; loadBooks(); }

$("bookGrid").addEventListener("click", (event) => {
  const card = event.target.closest(".book-card");
  if (!card) return;
  if (event.target.closest(".save-book")) {
    const saved = getSaved();
    const next = saved.includes(card.dataset.id) ? saved.filter((id) => id !== card.dataset.id) : [...saved, card.dataset.id];
    setSaved(next);
    loadBooks();
  } else if (event.target.closest(".book-open")) openBook(card.dataset.id);
});

$("searchInput").addEventListener("input", () => {
  clearTimeout(state.searchTimer);
  state.searchTimer = setTimeout(resetAndLoad, 280);
});
[$("categoryFilter"), $("ratingFilter"), $("sortFilter")].forEach((element) => element.addEventListener("change", resetAndLoad));
$("resetFilters").addEventListener("click", () => {
  $("searchInput").value = ""; $("categoryFilter").value = ""; $("ratingFilter").value = ""; $("sortFilter").value = "title-asc";
  state.savedOnly = false; $("savedButton").classList.remove("active"); resetAndLoad();
});
$("savedButton").addEventListener("click", () => { state.savedOnly = !state.savedOnly; $("savedButton").classList.toggle("active", state.savedOnly); resetAndLoad(); });
$("previousPage").addEventListener("click", () => { if (state.page > 1) { state.page -= 1; loadBooks(); $("catalogue").scrollIntoView(); } });
$("nextPage").addEventListener("click", () => { state.page += 1; loadBooks(); $("catalogue").scrollIntoView(); });
$("closeDialog").addEventListener("click", () => $("bookDialog").close());
$("bookDialog").addEventListener("click", (event) => { if (event.target === $("bookDialog")) $("bookDialog").close(); });

setSaved(getSaved());
if (client) loadCategories().then(loadBooks).catch((error) => {
  $("errorNotice").textContent = `Setup error: ${error.message}`;
  $("errorNotice").classList.remove("hidden");
});
else loadBooks();

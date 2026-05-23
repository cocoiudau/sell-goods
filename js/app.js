const state = {
  products: [...window.PRODUCTS_DATA],
  cart: JSON.parse(localStorage.getItem("freshcart-cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("freshcart-wishlist") || "[]"),
  token: localStorage.getItem("freshcart-token") || "",
  currentUser: JSON.parse(localStorage.getItem("freshcart-user") || "null"),
  filters: {
    search: "",
    category: "All",
    price: "All",
  },
  editingId: null,
};

const categories = [
  "Vegetables",
  "Fruits",
  "Drinks",
  "Snacks",
  "Meat & Seafood",
  "Household items",
];
const icons = {
  Vegetables: "carrot",
  Fruits: "apple",
  Drinks: "cup-soda",
  Snacks: "cookie",
  "Meat & Seafood": "fish",
  "Household items": "spray-can",
};

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const money = (value) => `$${Number(value).toFixed(2)}`;
const API_BASE = "https://sell-goods-production.up.railway.app/api";

function saveStore() {
  localStorage.setItem("freshcart-cart", JSON.stringify(state.cart));
  localStorage.setItem("freshcart-wishlist", JSON.stringify(state.wishlist));
}

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function showToast(message) {
  const area = qs("#toastArea");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  area.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Server request failed.");
  }

  return data;
}

function saveAuth(user, token) {
  state.currentUser = user;
  state.token = token;
  localStorage.setItem("freshcart-user", JSON.stringify(user));
  localStorage.setItem("freshcart-token", token);
  renderAuthState();
}

function clearAuth() {
  state.currentUser = null;
  state.token = "";
  localStorage.removeItem("freshcart-user");
  localStorage.removeItem("freshcart-token");
  renderAuthState();
}

function renderAuthState() {
  const loggedIn = Boolean(state.currentUser);
  qs("#userChip").classList.toggle("hidden", !loggedIn);
  qs("#logoutBtn").classList.toggle("hidden", !loggedIn);
  qsa(".auth-link").forEach((link) =>
    link.classList.toggle("hidden", loggedIn),
  );

  if (loggedIn) {
    qs("#userName").textContent = state.currentUser.name;
  }

  initIcons();
}

function navigate(pageId) {
  qsa(".page").forEach((page) =>
    page.classList.toggle("active", page.id === pageId),
  );
  qsa("[data-page]").forEach((link) =>
    link.classList.toggle("active", link.dataset.page === pageId),
  );
  qs("#mobileMenu").classList.remove("open");
  qs("#cartDrawer").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (pageId === "checkoutPage") renderCheckout();
}

// Centralized product filtering keeps search, category, and price controls in sync.
function filteredProducts() {
  return state.products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(state.filters.search.toLowerCase());
    const matchesCategory =
      state.filters.category === "All" ||
      product.category === state.filters.category;
    const matchesPrice =
      state.filters.price === "All" ||
      (state.filters.price === "under5" && product.price < 5) ||
      (state.filters.price === "5to10" &&
        product.price >= 5 &&
        product.price <= 10) ||
      (state.filters.price === "over10" && product.price > 10);
    return matchesSearch && matchesCategory && matchesPrice;
  });
}

function renderProducts(targetId, products, limit = products.length) {
  const target = qs(`#${targetId}`);
  const list = products.slice(0, limit);

  if (!list.length) {
    target.innerHTML = `<div class="empty-state"><div><i data-lucide="search-x"></i><h3>No products found</h3><p>Try a different search, category, or price filter.</p></div></div>`;
    initIcons();
    return;
  }

  target.innerHTML = list
    .map((product) => {
      const wished = state.wishlist.includes(product.id);
      return `
      <article class="product-card">
        <div class="product-media" role="button" tabindex="0" data-detail="${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <span class="badge">${product.badge}</span>
          <button class="icon-btn wish-btn ${wished ? "active" : ""}" data-wishlist="${product.id}" aria-label="Toggle ${product.name} wishlist">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="product-info">
          <div class="product-meta">
            <span>${product.category}</span>
            <span class="rating"><i data-lucide="star"></i>${product.rating}</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <div class="price-row">
            <div><span class="price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></div>
            <button class="add-btn" data-add="${product.id}" aria-label="Add ${product.name} to cart"><i data-lucide="plus"></i></button>
          </div>
        </div>
      </article>
    `;
    })
    .join("");
  initIcons();
}

function renderCategories() {
  qs("#categoryGrid").innerHTML = categories
    .map(
      (category) => `
    <button class="category-card" data-category-shortcut="${category}">
      <span class="category-icon"><i data-lucide="${icons[category]}"></i></span>
      <span>${category}</span>
    </button>
  `,
    )
    .join("");
}

// The cart lives in localStorage so the demo keeps quantities between refreshes.
function renderCart() {
  const cartItems = qs("#cartItems");
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => {
    const product = state.products.find(
      (candidate) => candidate.id === item.id,
    );
    return product ? sum + product.price * item.qty : sum;
  }, 0);
  const delivery = subtotal > 0 && subtotal < 40 ? 4.99 : 0;
  const total = subtotal + delivery;

  qs("#cartCount").textContent = totalQty;
  qs("#cartSubtotal").textContent = money(subtotal);
  qs("#cartDelivery").textContent = delivery ? money(delivery) : "Free";
  qs("#cartTotal").textContent = money(total);

  if (!state.cart.length) {
    cartItems.innerHTML = `<div class="empty-state"><div><i data-lucide="shopping-basket"></i><h3>Your cart is empty</h3><p>Add fresh groceries and they will appear here.</p></div></div>`;
    initIcons();
    return;
  }

  cartItems.innerHTML = state.cart
    .map((item) => {
      const product = state.products.find(
        (candidate) => candidate.id === item.id,
      );
      if (!product) return "";
      return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <strong>${money(product.price * item.qty)}</strong>
          <div class="qty-controls" aria-label="${product.name} quantity controls">
            <button data-dec="${product.id}" aria-label="Decrease quantity">-</button>
            <span>${item.qty}</span>
            <button data-inc="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="icon-btn" data-remove="${product.id}" aria-label="Remove ${product.name}"><i data-lucide="trash-2"></i></button>
      </div>
    `;
    })
    .join("");
  initIcons();
}

function addToCart(id) {
  const product = state.products.find((item) => item.id === id);
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id, qty: 1 });
  saveStore();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function updateCart(id, action) {
  const item = state.cart.find((candidate) => candidate.id === id);
  if (!item) return;
  if (action === "inc") item.qty += 1;
  if (action === "dec") item.qty -= 1;
  if (action === "remove" || item.qty <= 0)
    state.cart = state.cart.filter((candidate) => candidate.id !== id);
  saveStore();
  renderCart();
}

function toggleWishlist(id) {
  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter((item) => item !== id);
    showToast("Removed from wishlist");
  } else {
    state.wishlist.push(id);
    showToast("Saved to wishlist");
  }
  saveStore();
  renderProducts("featuredProducts", state.products, 8);
  renderProducts("allProducts", filteredProducts());
}

function openDetail(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;
  qs("#modalTitle").textContent = product.name;
  qs("#modalBody").innerHTML = `
    <div class="detail-grid">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <p class="eyebrow">${product.category}</p>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p class="rating"><i data-lucide="star"></i>${product.rating} rating · ${product.stock} in stock</p>
        <p><span class="price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></p>
        <button class="btn btn-primary" data-add="${product.id}"><i data-lucide="shopping-cart"></i>Add to cart</button>
      </div>
    </div>
  `;
  qs("#productModal").classList.add("open");
  initIcons();
}

function renderAdmin() {
  qs("#adminProductRows").innerHTML = state.products
    .map(
      (product) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${money(product.price)}</td>
      <td>${product.stock}</td>
      <td>
        <div class="table-actions">
          <button class="icon-btn" data-edit-product="${product.id}" aria-label="Edit ${product.name}"><i data-lucide="pencil"></i></button>
          <button class="icon-btn" data-delete-product="${product.id}" aria-label="Delete ${product.name}"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
  qs("#adminProductsCount").textContent = state.products.length;
  qs("#adminOrdersTotal").textContent = Math.max(18, state.cart.length + 18);
  initIcons();
}

function upsertProduct(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const product = {
    id: state.editingId || Date.now(),
    name: formData.get("name").trim(),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    oldPrice: Number(formData.get("oldPrice")),
    rating: Number(formData.get("rating")),
    stock: Number(formData.get("stock")),
    image: formData.get("image").trim(),
    badge: formData.get("badge").trim() || "New",
    description: formData.get("description").trim(),
  };

  if (state.editingId) {
    state.products = state.products.map((item) =>
      item.id === state.editingId ? product : item,
    );
    showToast("Product updated");
  } else {
    state.products.unshift(product);
    showToast("Product added");
  }

  state.editingId = null;
  form.reset();
  qs("#adminSubmitText").textContent = "Add product";
  refreshProductViews();
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;
  const form = qs("#adminForm");
  Object.entries(product).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  state.editingId = id;
  qs("#adminSubmitText").textContent = "Save changes";
  showToast("Editing product");
}

function deleteProduct(id) {
  state.products = state.products.filter((item) => item.id !== id);
  state.cart = state.cart.filter((item) => item.id !== id);
  state.wishlist = state.wishlist.filter((item) => item !== id);
  saveStore();
  refreshProductViews();
  showToast("Product deleted");
}

function refreshProductViews() {
  renderProducts("featuredProducts", state.products, 8);
  renderProducts("allProducts", filteredProducts());
  renderCart();
  renderAdmin();
}

function renderCheckout() {
  const list = qs("#checkoutList");
  const checkoutName = qs("#checkoutName");
  const checkoutAddress = qs("#checkoutAddress");
  if (state.currentUser) {
    checkoutName.value = state.currentUser.name || "";
    checkoutAddress.value = state.currentUser.address || "";
  }

  if (!state.cart.length) {
    list.innerHTML = `<div class="empty-state"><div><i data-lucide="shopping-cart"></i><h3>No items yet</h3><p>Add groceries before checkout.</p></div></div>`;
    initIcons();
    return;
  }
  list.innerHTML = state.cart
    .map((item) => {
      const product = state.products.find(
        (candidate) => candidate.id === item.id,
      );
      return `
      <div class="checkout-row">
        <div>
          <strong>${product.name}</strong>
          <p>${item.qty} x ${money(product.price)}</p>
        </div>
        <strong>${money(product.price * item.qty)}</strong>
      </div>
    `;
    })
    .join("");
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const payload = {
    name: formData.get("name").trim(),
    email: formData.get("email").trim().toLowerCase(),
    password: formData.get("password"),
    phone: formData.get("phone").trim(),
    address: formData.get("address").trim(),
  };

  button.disabled = true;
  try {
    const data = await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveAuth(data.user, data.token);
    form.reset();
    showToast("Account registration successful!");
    navigate("homePage");
  } catch (error) {
    showToast(
      error.message.includes("fetch")
        ? "Please start the Node.js server first"
        : error.message,
    );
  } finally {
    button.disabled = false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const payload = {
    email: formData.get("email").trim().toLowerCase(),
    password: formData.get("password"),
  };

  button.disabled = true;
  try {
    const data = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveAuth(data.user, data.token);
    form.reset();
    showToast(`Welcome back, ${data.user.name}`);
    navigate("homePage");
  } catch (error) {
    showToast(
      error.message.includes("fetch")
        ? "Please start the Node.js server first"
        : error.message,
    );
  } finally {
    button.disabled = false;
  }
}

async function restoreSession() {
  renderAuthState();

  if (!state.token) return;

  try {
    const data = await apiRequest("/me");
    saveAuth(data.user, state.token);
  } catch (error) {
    clearAuth();
  }
}

function startCountdown() {
  const target = Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 42;
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    qs("#days").textContent = String(days).padStart(2, "0");
    qs("#hours").textContent = String(hours).padStart(2, "0");
    qs("#minutes").textContent = String(minutes).padStart(2, "0");
    qs("#seconds").textContent = String(seconds).padStart(2, "0");
  };
  tick();
  setInterval(tick, 1000);
}

function showSkeletons() {
  qs("#featuredProducts").innerHTML = Array.from(
    { length: 8 },
    () => `<div class="skeleton-card"></div>`,
  ).join("");
  qs("#allProducts").innerHTML = Array.from(
    { length: 8 },
    () => `<div class="skeleton-card"></div>`,
  ).join("");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button, a, [role='button']");
    if (!button) return;

    if (button.matches("a[href='#products'], a[href='#offers']")) {
      event.preventDefault();
      navigate("homePage");
      setTimeout(
        () =>
          qs(button.getAttribute("href")).scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        120,
      );
    }

    if (button.matches("[data-page]")) {
      event.preventDefault();
      navigate(button.dataset.page);
    }

    if (button.matches("[data-add]")) addToCart(Number(button.dataset.add));
    if (button.matches("[data-inc]"))
      updateCart(Number(button.dataset.inc), "inc");
    if (button.matches("[data-dec]"))
      updateCart(Number(button.dataset.dec), "dec");
    if (button.matches("[data-remove]"))
      updateCart(Number(button.dataset.remove), "remove");
    if (button.matches("[data-wishlist]")) {
      event.stopPropagation();
      toggleWishlist(Number(button.dataset.wishlist));
    }
    if (button.matches("[data-detail]"))
      openDetail(Number(button.dataset.detail));
    if (button.matches("[data-category-shortcut]")) {
      state.filters.category = button.dataset.categoryShortcut;
      qs("#categoryFilter").value = state.filters.category;
      navigate("homePage");
      qs("#products").scrollIntoView({ behavior: "smooth", block: "start" });
      renderProducts("allProducts", filteredProducts());
    }
    if (button.matches("[data-edit-product]"))
      editProduct(Number(button.dataset.editProduct));
    if (button.matches("[data-delete-product]"))
      deleteProduct(Number(button.dataset.deleteProduct));
  });

  qs("#cartToggle").addEventListener("click", () =>
    qs("#cartDrawer").classList.add("open"),
  );
  qs("#closeCart").addEventListener("click", () =>
    qs("#cartDrawer").classList.remove("open"),
  );
  qs("#menuToggle").addEventListener("click", () =>
    qs("#mobileMenu").classList.toggle("open"),
  );
  qs("#closeModal").addEventListener("click", () =>
    qs("#productModal").classList.remove("open"),
  );
  qs("#productModal").addEventListener("click", (event) => {
    if (event.target.id === "productModal")
      qs("#productModal").classList.remove("open");
  });

  qs("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "freshcart-theme",
      document.body.classList.contains("dark") ? "dark" : "light",
    );
    initIcons();
  });
  qs("#logoutBtn").addEventListener("click", () => {
    clearAuth();
    showToast("Logged out");
    navigate("homePage");
  });

  qs("#searchInput").addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderProducts("allProducts", filteredProducts());
  });
  qs("#categoryFilter").addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderProducts("allProducts", filteredProducts());
  });
  qs("#priceFilter").addEventListener("change", (event) => {
    state.filters.price = event.target.value;
    renderProducts("allProducts", filteredProducts());
  });

  qs("#adminForm").addEventListener("submit", upsertProduct);
  qs("#registerForm").addEventListener("submit", handleRegister);
  qs("#loginForm").addEventListener("submit", handleLogin);
  qs("#placeOrder").addEventListener("click", () => {
    if (!state.cart.length) {
      showToast("Your cart is empty");
      return;
    }
    state.cart = [];
    saveStore();
    renderCart();
    renderCheckout();
    showToast("Order placed successfully");
  });
}

function init() {
  if (localStorage.getItem("freshcart-theme") === "dark")
    document.body.classList.add("dark");
  showSkeletons();
  renderCategories();
  bindEvents();
  restoreSession();
  startCountdown();

  setTimeout(() => {
    refreshProductViews();
    initIcons();
  }, 450);
}

document.addEventListener("DOMContentLoaded", init);

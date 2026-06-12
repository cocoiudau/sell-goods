const state = {
  products: [...(window.PRODUCTS_DATA || [])],
  cart: JSON.parse(localStorage.getItem("freshcart-cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("freshcart-wishlist") || "[]"),
  token: localStorage.getItem("freshcart-token") || "",
  currentUser: JSON.parse(localStorage.getItem("freshcart-user") || "null"),
  filters: {
    search: "",
    category: "All",
    price: "All",
  },
  lang: localStorage.getItem("freshcart-lang") || "vi",
  editingId: null,
};

const categories = [
  "Rau củ quả",
  "Sữa & trứng",
  "Thịt tươi",
  "Gạo & thực phẩm khô",
  "Đồ uống",
  "Bánh kẹo & ăn vặt",
  "Gia dụng & vệ sinh",
];

const icons = {
  "Rau củ quả": "carrot",
  "Sữa & trứng": "milk",
  "Thịt tươi": "beef",
  "Gạo & thực phẩm khô": "wheat",
  "Đồ uống": "cup-soda",
  "Bánh kẹo & ăn vặt": "cookie",
  "Gia dụng & vệ sinh": "spray-can",
};

const categoryLabels = {
  vi: {
    All: "Tất cả",
    "Rau củ quả": "Rau củ quả",
    "Sữa & trứng": "Sữa & trứng",
    "Thịt tươi": "Thịt tươi",
    "Gạo & thực phẩm khô": "Gạo & thực phẩm khô",
    "Đồ uống": "Đồ uống",
    "Bánh kẹo & ăn vặt": "Bánh kẹo & ăn vặt",
    "Gia dụng & vệ sinh": "Gia dụng & vệ sinh",
  },
  en: {
    All: "All",
    "Rau củ quả": "Vegetables",
    "Sữa & trứng": "Milk & eggs",
    "Thịt tươi": "Fresh meat",
    "Gạo & thực phẩm khô": "Rice & pantry",
    "Đồ uống": "Drinks",
    "Bánh kẹo & ăn vặt": "Snacks & sweets",
    "Gia dụng & vệ sinh": "Household",
  },
};

const translations = {
  vi: {
    noProductsTitle: "Không tìm thấy sản phẩm",
    noProductsCopy: "Hãy thử từ khóa, danh mục hoặc mức giá khác.",
    addToCart: "Thêm vào giỏ",
    addProduct: "Thêm sản phẩm",
    saveChanges: "Lưu thay đổi",
    ratingStock: "đánh giá · còn hàng",
    cartEmptyTitle: "Giỏ hàng đang trống",
    cartEmptyCopy: "Thêm sản phẩm siêu thị vào giỏ để xem tại đây.",
    checkoutEmptyTitle: "Chưa có sản phẩm",
    checkoutEmptyCopy: "Hãy thêm sản phẩm trước khi thanh toán.",
    deliveryFree: "Miễn phí",
    addedToCart: "đã được thêm vào giỏ",
    removedWishlist: "Đã bỏ khỏi yêu thích",
    savedWishlist: "Đã lưu vào yêu thích",
    productUpdated: "Đã cập nhật sản phẩm",
    productAdded: "Đã thêm sản phẩm",
    editingProduct: "Đang chỉnh sửa sản phẩm",
    productDeleted: "Đã xóa sản phẩm",
    registerSuccess: "Đăng ký tài khoản thành công!",
    startServer: "Vui lòng khởi động Node.js server trước",
    welcomeBack: "Chào mừng trở lại",
    loggedOut: "Đã đăng xuất",
    orderEmpty: "Giỏ hàng của bạn đang trống",
    orderPlaced: "Đặt hàng demo thành công",
    emptyField: "Sản phẩm không tồn tại",
    lightMode: "Chế độ sáng",
    darkMode: "Chế độ tối",
    loginFailed: "Đăng nhập thất bại, vui lòng thử lại",
    registerFailed: "Đăng ký thất bại, vui lòng thử lại",
  },
  en: {
    noProductsTitle: "No products found",
    noProductsCopy: "Try a different search, category, or price filter.",
    addToCart: "Add to cart",
    addProduct: "Add product",
    saveChanges: "Save changes",
    ratingStock: "rating · in stock",
    cartEmptyTitle: "Your cart is empty",
    cartEmptyCopy: "Add supermarket products and they will appear here.",
    checkoutEmptyTitle: "No items yet",
    checkoutEmptyCopy: "Add products before checkout.",
    deliveryFree: "Free",
    addedToCart: "added to cart",
    removedWishlist: "Removed from wishlist",
    savedWishlist: "Saved to wishlist",
    productUpdated: "Product updated",
    productAdded: "Product added",
    editingProduct: "Editing product",
    productDeleted: "Product deleted",
    registerSuccess: "Account registration successful!",
    startServer: "Please start the Node.js server first",
    welcomeBack: "Welcome back",
    loggedOut: "Logged out",
    orderEmpty: "Your cart is empty",
    orderPlaced: "Demo order placed successfully",
    emptyField: "Product is unavailable",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    loginFailed: "Login failed, please try again",
    registerFailed: "Registration failed, please try again",
  },
};

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const money = (value) => vndFormatter.format(Number(value));
const FREE_DELIVERY_MIN = 500000;
const DELIVERY_FEE = 25000;
const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port === "5500" || !window.location.port ? "3000" : window.location.port}/api`
    : atob("aHR0cHM6Ly9zZWxsLWdvb2RzLXByb2R1Y3Rpb24udXAucmFpbHdheS5hcHAvYXBp");

function t(key) {
  return translations[state.lang][key] || translations.vi[key] || key;
}

function categoryText(category) {
  return categoryLabels[state.lang][category] || category;
}

function productName(product) {
  return state.lang === "en" ? product.nameEn || product.name : product.name;
}

function productDescription(product) {
  return state.lang === "en"
    ? product.descriptionEn || product.description
    : product.description;
}

function saveStore() {
  localStorage.setItem("freshcart-cart", JSON.stringify(state.cart));
  localStorage.setItem("freshcart-wishlist", JSON.stringify(state.wishlist));
}

function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function showToast(message) {
  const area = qs("#toastArea");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  area.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function applyTranslations() {
  document.documentElement.lang = state.lang;
  const suffix = state.lang === "vi" ? "Vi" : "En";
  qsa("[data-i18n]").forEach((node) => {
    const value = node.dataset[`i18n${suffix}`];
    if (!value) return;
    if (!node.children.length) {
      node.textContent = value;
      return;
    }
    const textNode = [...node.childNodes].find(
      (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim(),
    );
    if (textNode) textNode.textContent = value;
    else node.append(document.createTextNode(value));
  });
  qsa("[data-i18n-placeholder]").forEach((node) => {
    const value = node.dataset[`i18nPlaceholder${suffix}`];
    if (value) node.setAttribute("placeholder", value);
  });
  qsa("[data-i18n-label]").forEach((node) => {
    const value = node.dataset[`i18nLabel${suffix}`];
    if (value) node.setAttribute("aria-label", value);
  });

  const langLabel = qs("#languageLabel");
  if (langLabel) langLabel.textContent = state.lang === "vi" ? "Tiếng Việt" : "English";
  const themeLabel = qs("#themeLabel");
  if (themeLabel)
    themeLabel.textContent = document.body.classList.contains("dark")
      ? t("darkMode")
      : t("lightMode");
  if (!state.editingId && qs("#adminSubmitText"))
    qs("#adminSubmitText").textContent = t("addProduct");

  renderCategoryOptions();
  refreshProductViews();
  initIcons();
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
    const error = new Error(data.message || "Server request failed.");
    error.status = response.status;
    throw error;
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
  if (loggedIn) qs("#userName").textContent = state.currentUser.name;
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

function filteredProducts() {
  return state.products.filter((product) => {
    const haystack = `${product.name} ${product.nameEn || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(state.filters.search.toLowerCase());
    const matchesCategory =
      state.filters.category === "All" ||
      product.category === state.filters.category;
    const matchesPrice =
      state.filters.price === "All" ||
      (state.filters.price === "under50" && product.price < 50000) ||
      (state.filters.price === "50to100" &&
        product.price >= 50000 &&
        product.price <= 100000) ||
      (state.filters.price === "over100" && product.price > 100000);
    return matchesSearch && matchesCategory && matchesPrice;
  });
}

function featuredProducts() {
  return categories
    .map((category) =>
      state.products.find((product) => product.category === category),
    )
    .filter(Boolean);
}

function renderCategoryOptions() {
  const selected = state.filters.category;
  const categoryFilter = qs("#categoryFilter");
  const adminCategory = qs("#adminCategory");
  if (categoryFilter) {
    categoryFilter.innerHTML = [
      `<option value="All">${categoryText("All")}</option>`,
      ...categories.map(
        (category) =>
          `<option value="${category}">${categoryText(category)}</option>`,
      ),
    ].join("");
    categoryFilter.value = selected;
  }
  if (adminCategory) {
    adminCategory.innerHTML = categories
      .map(
        (category) =>
          `<option value="${category}">${categoryText(category)}</option>`,
      )
      .join("");
  }
}

function renderProducts(targetId, products, limit = products.length) {
  const target = qs(`#${targetId}`);
  const list = products.slice(0, limit);
  if (!list.length) {
    target.innerHTML = `<div class="empty-state"><div><i data-lucide="search-x"></i><h3>${t("noProductsTitle")}</h3><p>${t("noProductsCopy")}</p></div></div>`;
    initIcons();
    return;
  }
  target.innerHTML = list
    .map((product) => {
      const wished = state.wishlist.includes(product.id);
      const name = productName(product);
      return `
      <article class="product-card">
        <div class="product-media" role="button" tabindex="0" data-detail="${product.id}">
          <img src="${product.image}" alt="${name}" loading="lazy">
          <span class="badge">${product.badge}</span>
          <button class="icon-btn wish-btn ${wished ? "active" : ""}" data-wishlist="${product.id}" aria-label="Wishlist ${name}">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="product-info">
          <div class="product-meta">
            <span>${categoryText(product.category)}</span>
            <span class="rating"><i data-lucide="star"></i>${product.rating}</span>
          </div>
          <h3 class="product-title">${name}</h3>
          <div class="price-row">
            <div><span class="price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></div>
            <button class="add-btn" data-add="${product.id}" aria-label="${t("addToCart")} ${name}"><i data-lucide="plus"></i></button>
          </div>
        </div>
      </article>`;
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
      <span>${categoryText(category)}</span>
    </button>`,
    )
    .join("");
}

function renderCart() {
  const cartItems = qs("#cartItems");
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => {
    const product = state.products.find((candidate) => candidate.id === item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
  const delivery =
    subtotal > 0 && subtotal < FREE_DELIVERY_MIN ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  qs("#cartCount").textContent = totalQty;
  qs("#cartSubtotal").textContent = money(subtotal);
  qs("#cartDelivery").textContent = delivery ? money(delivery) : t("deliveryFree");
  qs("#cartTotal").textContent = money(total);

  if (!state.cart.length) {
    cartItems.innerHTML = `<div class="empty-state"><div><i data-lucide="shopping-basket"></i><h3>${t("cartEmptyTitle")}</h3><p>${t("cartEmptyCopy")}</p></div></div>`;
    initIcons();
    return;
  }
  cartItems.innerHTML = state.cart
    .map((item) => {
      const product = state.products.find((candidate) => candidate.id === item.id);
      if (!product) return "";
      const name = productName(product);
      return `
      <div class="cart-item">
        <img src="${product.image}" alt="${name}">
        <div>
          <h4>${name}</h4>
          <strong>${money(product.price * item.qty)}</strong>
          <div class="qty-controls" aria-label="${name} quantity controls">
            <button data-dec="${product.id}" aria-label="Decrease quantity">-</button>
            <span>${item.qty}</span>
            <button data-inc="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="icon-btn" data-remove="${product.id}" aria-label="Remove ${name}"><i data-lucide="trash-2"></i></button>
      </div>`;
    })
    .join("");
  initIcons();
}

function addToCart(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id, qty: 1 });
  saveStore();
  renderCart();
  showToast(`${productName(product)} ${t("addedToCart")}`);
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
    showToast(t("removedWishlist"));
  } else {
    state.wishlist.push(id);
    showToast(t("savedWishlist"));
  }
  saveStore();
  renderProducts("featuredProducts", featuredProducts());
  renderProducts("allProducts", filteredProducts());
}

function openDetail(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;
  const name = productName(product);
  qs("#modalTitle").textContent = name;
  qs("#modalBody").innerHTML = `
    <div class="detail-grid">
      <img src="${product.image}" alt="${name}">
      <div>
        <p class="eyebrow">${categoryText(product.category)}</p>
        <h2>${name}</h2>
        <p>${productDescription(product)}</p>
        <p class="rating"><i data-lucide="star"></i>${product.rating} ${t("ratingStock")} ${product.stock}</p>
        <p><span class="price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></p>
        ${product.sourceUrl ? `<a class="btn btn-ghost source-link" href="${product.sourceUrl}" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Bách Hóa Xanh</a>` : ""}
        <button class="btn btn-primary" data-add="${product.id}"><i data-lucide="shopping-cart"></i>${t("addToCart")}</button>
      </div>
    </div>`;
  qs("#productModal").classList.add("open");
  initIcons();
}

function renderAdmin() {
  qs("#adminProductRows").innerHTML = state.products
    .map(
      (product) => `
    <tr>
      <td>${productName(product)}</td>
      <td>${categoryText(product.category)}</td>
      <td>${money(product.price)}</td>
      <td>${product.stock}</td>
      <td>
        <div class="table-actions">
          <button class="icon-btn" data-edit-product="${product.id}" aria-label="Edit ${productName(product)}"><i data-lucide="pencil"></i></button>
          <button class="icon-btn" data-delete-product="${product.id}" aria-label="Delete ${productName(product)}"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>`,
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
    nameEn: formData.get("nameEn").trim() || formData.get("name").trim(),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    oldPrice: Number(formData.get("oldPrice")),
    rating: Number(formData.get("rating")),
    stock: Number(formData.get("stock")),
    image: formData.get("image").trim(),
    badge: formData.get("badge").trim() || "New",
    description: formData.get("description").trim(),
    descriptionEn:
      formData.get("descriptionEn").trim() || formData.get("description").trim(),
  };

  if (state.editingId) {
    state.products = state.products.map((item) =>
      item.id === state.editingId ? product : item,
    );
    showToast(t("productUpdated"));
  } else {
    state.products.unshift(product);
    showToast(t("productAdded"));
  }
  state.editingId = null;
  form.reset();
  qs("#adminSubmitText").textContent = t("addProduct");
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
  qs("#adminSubmitText").textContent = t("saveChanges");
  showToast(t("editingProduct"));
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteProduct(id) {
  state.products = state.products.filter((item) => item.id !== id);
  state.cart = state.cart.filter((item) => item.id !== id);
  state.wishlist = state.wishlist.filter((item) => item !== id);
  saveStore();
  refreshProductViews();
  showToast(t("productDeleted"));
}

function refreshProductViews() {
  renderCategories();
  renderProducts("featuredProducts", featuredProducts());
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
    list.innerHTML = `<div class="empty-state"><div><i data-lucide="shopping-cart"></i><h3>${t("checkoutEmptyTitle")}</h3><p>${t("checkoutEmptyCopy")}</p></div></div>`;
    initIcons();
    return;
  }
  list.innerHTML = state.cart
    .map((item) => {
      const product = state.products.find((candidate) => candidate.id === item.id);
      if (!product) return "";
      return `
      <div class="checkout-row">
        <div>
          <strong>${productName(product)}</strong>
          <p>${item.qty} x ${money(product.price)}</p>
        </div>
        <strong>${money(product.price * item.qty)}</strong>
      </div>`;
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
    showToast(t("registerSuccess"));
    navigate("homePage");
  } catch (error) {
    if (error.message.includes("fetch")) {
      showToast(t("startServer"));
    } else if (error.status >= 500) {
      console.error("Registration backend error:", error.message);
      showToast(t("registerFailed"));
    } else {
      showToast(error.message);
    }
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
    showToast(`${t("welcomeBack")}, ${data.user.name}`);
    navigate("homePage");
  } catch (error) {
    if (error.message.includes("fetch")) {
      showToast(t("startServer"));
    } else if (error.status >= 500) {
      console.error("Login backend error:", error.message);
      showToast(t("loginFailed"));
    } else {
      showToast(error.message);
    }
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
    qs("#days").textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
    qs("#hours").textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
    qs("#minutes").textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    qs("#seconds").textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  };
  tick();
  setInterval(tick, 1000);
}

function showSkeletons() {
  qs("#featuredProducts").innerHTML = Array.from(
    { length: categories.length },
    () => `<div class="skeleton-card"></div>`,
  ).join("");
  qs("#allProducts").innerHTML = Array.from(
    { length: 8 },
    () => `<div class="skeleton-card"></div>`,
  ).join("");
}

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("freshcart-theme", isDark ? "dark" : "light");
  const themeIcon = qs("#themeChoice i");
  if (themeIcon) themeIcon.setAttribute("data-lucide", isDark ? "moon" : "sun");
  const themeLabel = qs("#themeLabel");
  if (themeLabel) themeLabel.textContent = isDark ? t("darkMode") : t("lightMode");
  initIcons();
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
    if (button.matches("[data-inc]")) updateCart(Number(button.dataset.inc), "inc");
    if (button.matches("[data-dec]")) updateCart(Number(button.dataset.dec), "dec");
    if (button.matches("[data-remove]"))
      updateCart(Number(button.dataset.remove), "remove");
    if (button.matches("[data-wishlist]")) {
      event.stopPropagation();
      toggleWishlist(Number(button.dataset.wishlist));
    }
    if (button.matches("[data-detail]")) openDetail(Number(button.dataset.detail));
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
  qs("#settingsToggle").addEventListener("click", (event) => {
    event.stopPropagation();
    qs("#settingsMenu").classList.toggle("open");
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".settings-wrap"))
      qs("#settingsMenu").classList.remove("open");
  });
  qs("#themeChoice").addEventListener("click", () => {
    setTheme(!document.body.classList.contains("dark"));
    qs("#settingsMenu").classList.remove("open");
  });
  qs("#languageChoice").addEventListener("click", () => {
    state.lang = state.lang === "vi" ? "en" : "vi";
    localStorage.setItem("freshcart-lang", state.lang);
    applyTranslations();
    qs("#settingsMenu").classList.remove("open");
  });
  qs("#closeModal").addEventListener("click", () =>
    qs("#productModal").classList.remove("open"),
  );
  qs("#productModal").addEventListener("click", (event) => {
    if (event.target.id === "productModal")
      qs("#productModal").classList.remove("open");
  });
  qs("#logoutBtn").addEventListener("click", () => {
    clearAuth();
    qs("#settingsMenu").classList.remove("open");
    showToast(t("loggedOut"));
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
      showToast(t("orderEmpty"));
      return;
    }
    state.cart = [];
    saveStore();
    renderCart();
    renderCheckout();
    showToast(t("orderPlaced"));
  });
}

function init() {
  setTheme(localStorage.getItem("freshcart-theme") === "dark");
  showSkeletons();
  renderCategoryOptions();
  bindEvents();
  restoreSession();
  startCountdown();
  applyTranslations();
  setTimeout(() => {
    refreshProductViews();
    initIcons();
  }, 450);
}

document.addEventListener("DOMContentLoaded", init);

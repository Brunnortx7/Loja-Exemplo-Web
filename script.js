const STORE_NAME = "Loja Exemplo";
const WHATSAPP_NUMBER = "5541984534917"; // ex: 5581999999999
const EXTRA_NOTE = "Olá! Quero fazer esse pedido:";


const PRODUCTS = [
  {
    "id": 1,
    "name": "Blush em Bastão Pixi",
    "price": 89.9,
    "category": "Beleza",
    "image": "assets/produto3.png",
    "tag": "Novo"
  },
  {
    "id": 2,
    "name": "Iphone",
    "price": 2999.9,
    "category": "Eletrônicos",
    "image": "assets/produto4.png",
    "tag": "Top"
  },
  {
    "id": 3,
    "name": "Notebook ",
    "price": 4299.9,
    "category": "Eletrônicos",
    "image": "assets/produto5.png",
    "tag": "Premium"
  },
  {
    "id": 4,
    "name": "Secador Britânia 1200W",
    "price": 129.9,
    "category": "Beleza",
    "image": "assets/produto7.png",
    "tag": "Oferta"
  },
  {
    "id": 5,
    "name": "Câmera Canon",
    "price": 2499.9,
    "category": "Eletrônicos",
    "image": "assets/produto8.png",
    "tag": "Foto"
  },
  {
    "id": 6,
    "name": "Bolsa Preta",
    "price": 159.9,
    "category": "Acessórios",
    "image": "assets/produto9.png",
    "tag": "Daily"
  },
  {
    "id": 7,
    "name": "Mouse Gamer Dock",
    "price": 199.9,
    "category": "Acessórios",
    "image": "assets/produto10.png",
    "tag": "RGB"
  },
  {
    "id": 8,
    "name": "Carregador USB‑C + Cabo",
    "price": 79.9,
    "category": "Acessórios",
    "image": "assets/produto1.png",
    "tag": "Fast"
  },
  {
    "id": 9,
    "name": "Impressora",
    "price": 499.9,
    "category": "Casa",
    "image": "assets/produto2.png",
    "tag": "Home"
  },
];

const STORAGE_KEY = "loja_carrinho_v2";
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.id === "string" && Number.isFinite(i.qty) && i.qty > 0)
      .map((i) => ({ id: i.id, qty: Math.floor(i.qty) }));
  } catch {
    return [];
  }
}
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatBRL(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
function getCartCount() {
  return cart.reduce((acc, i) => acc + i.qty, 0);
}
function getCartTotal() {
  return cart.reduce((acc, i) => {
    const p = findProduct(i.id);
    return p ? acc + p.price * i.qty : acc;
  }, 0);
}
function ensureWhatsappNumber() {
  return typeof WHATSAPP_NUMBER === "string" && /^55\d{10,13}$/.test(WHATSAPP_NUMBER);
}
function setWhatsappTexts() {
  const txt = ensureWhatsappNumber() ? `+${WHATSAPP_NUMBER}` : "configure no script.js";
  const ids = ["homeWhatsapp", "contactWhatsapp", "footerWhatsapp"];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }
}


setWhatsappTexts();

const productGrid = document.getElementById("productGrid");
const isShopPage = !!productGrid;

if (isShopPage) {

  const cartCountEl = document.getElementById("cartCount");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");

  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutHint = document.getElementById("checkoutHint");

  const overlay = document.getElementById("overlay");
  const cartDrawer = document.getElementById("cartDrawer");

  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");

  const required = { cartCountEl, cartItemsEl, cartTotalEl, openCartBtn, closeCartBtn, clearCartBtn, checkoutBtn, overlay, cartDrawer, searchInput, categorySelect };
  for (const [k, v] of Object.entries(required)) {
    if (!v) console.warn(`[Loja] elemento faltando: ${k}`);
  }

  function uniqueCategories() {
    return Array.from(new Set(PRODUCTS.map(p => p.category))).sort((a,b)=>a.localeCompare(b));
  }

  function renderCategories() {
    const cats = uniqueCategories();
    categorySelect.innerHTML =
      `<option value="all">Todas categorias</option>` +
      cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  }

  function getFilteredProducts() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const cat = categorySelect.value;
    return PRODUCTS.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q);
      const matchCat = cat === "all" || p.category === cat;
      return matchQ && matchCat;
    });
  }

  function renderProducts() {
    const list = getFilteredProducts();
    if (list.length === 0) {
      productGrid.innerHTML = `<p class="muted">Nenhum produto encontrado.</p>`;
      return;
    }

    productGrid.innerHTML = list.map(p => `
      <article class="card">
        <img class="card-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" />
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(p.name)}</h3>
          <div class="card-meta">
            <span>${escapeHtml(p.category)}</span>
            <span class="price">${formatBRL(p.price)}</span>
          </div>
          <button class="btn" type="button" data-add="${escapeHtml(p.id)}">Adicionar ao carrinho</button>
        </div>
      </article>
    `).join("");
  }

  function addToCart(id) {
    if (!findProduct(id)) return;
    const it = cart.find(x => x.id === id);
    if (it) it.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart();
    renderCart();
    openCart(); 
  }

  function changeQty(id, delta) {
    const it = cart.find(x => x.id === id);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter(x => x.id !== id);
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    cart = cart.filter(x => x.id !== id);
    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function renderCart() {
    cartCountEl.textContent = String(getCartCount());
    cartTotalEl.textContent = formatBRL(getCartTotal());

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p class="muted">Seu carrinho está vazio.</p>`;
      checkoutBtn.disabled = true;
      clearCartBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    clearCartBtn.disabled = false;

    cartItemsEl.innerHTML = cart.map(item => {
      const p = findProduct(item.id);
      if (!p) return "";
      const sub = p.price * item.qty;

      return `
        <div class="cart-item">
          <img class="cart-thumb" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" />
          <div class="cart-info">
            <div class="cart-name">${escapeHtml(p.name)}</div>
            <div class="cart-sub">${formatBRL(p.price)} • Subtotal: <strong>${formatBRL(sub)}</strong></div>
            <button class="remove" type="button" data-remove="${escapeHtml(p.id)}">Remover</button>
          </div>
          <div class="qty">
            <button type="button" data-qty="${escapeHtml(p.id)}" data-delta="-1">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty="${escapeHtml(p.id)}" data-delta="1">+</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function buildWhatsappMessage() {
    const lines = [EXTRA_NOTE, "", `Loja: ${STORE_NAME}`, "", "Pedido:"];
    for (const item of cart) {
      const p = findProduct(item.id);
      if (!p) continue;
      lines.push(`- ${item.qty}x ${p.name} (${formatBRL(p.price * item.qty)})`);
    }
    lines.push("", `Total: ${formatBRL(getCartTotal())}`);
    return lines.join("\n");
  }

  function checkoutWhatsapp() {
    if (cart.length === 0) return;

    if (!ensureWhatsappNumber()) {
      checkoutHint.textContent = "Configure WHATSAPP_NUMBER no script.js (formato 55DDDNUMERO).";
      return;
    }

    checkoutHint.textContent = "";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  let lastActiveEl = null;

  function openCart() {
    lastActiveEl = document.activeElement;
    overlay.hidden = false;
    cartDrawer.hidden = false;
    // animação (evita "pulo" no primeiro frame)
    requestAnimationFrame(() => {
      overlay.classList.add("is-open");
      cartDrawer.classList.add("is-open");
      document.body.classList.add("no-scroll");
      closeCartBtn?.focus?.();
    });
  }

  function closeCart() {
    overlay.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    document.body.classList.remove("no-scroll");

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      overlay.hidden = true;
      cartDrawer.hidden = true;
      cartDrawer.removeEventListener("transitionend", done);
      if (lastActiveEl && typeof lastActiveEl.focus === "function") lastActiveEl.focus();
    };
    cartDrawer.addEventListener("transitionend", done);

    setTimeout(done, 220);
  }

  // events
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) return addToCart(addBtn.getAttribute("data-add"));

    const qtyBtn = e.target.closest("[data-qty][data-delta]");
    if (qtyBtn) {
      const id = qtyBtn.getAttribute("data-qty");
      const delta = Number(qtyBtn.getAttribute("data-delta"));
      if (!Number.isFinite(delta)) return;
      return changeQty(id, delta);
    }

    const rmBtn = e.target.closest("[data-remove]");
    if (rmBtn) return removeItem(rmBtn.getAttribute("data-remove"));
  });

  openCartBtn?.addEventListener("click", openCart);
  closeCartBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeCart();
  });
  overlay?.addEventListener("click", closeCart);
  clearCartBtn?.addEventListener("click", clearCart);
  checkoutBtn?.addEventListener("click", checkoutWhatsapp);

  searchInput.addEventListener("input", renderProducts);
  categorySelect.addEventListener("change", renderProducts);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartDrawer && !cartDrawer.hidden) closeCart();
  });

  renderCategories();
  renderProducts();
  renderCart();
}
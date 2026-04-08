const menuItems = [
  {
    id: "dal-baati",
    name: "Fresh Gatta Sabji",
    price: 249,
    description: `Spicy, authentic and homemade.\n\nTraditional Rajasthani gatta sabji available today.\n\nRich in flavor\nFreshly cooked\nLimited plates\n\nDM now to order!`,
    imageLabel: "Fresh Gatta Sabji",
    imagePath: "assets/gatta-sabji.jpg"
  },
  {
    id: "gatte-ki-sabzi",
    name: "Dal Roti",
    price: 180,
    description: `Ghar Jaisa Khana, Ab Aapke Society Mein.\n\nEnjoy simple, comforting Dal Roti made fresh with pure ingredients and authentic homemade taste.\n\nLight and healthy\nPerfect for lunch and dinner\nFreshly cooked, just like home`,
    imageLabel: "Dal Roti",
    imagePath: "assets/dal-roti.jpg"
  },
  {
    id: "ker-sangri",
    name: "Bajre Ki Roti with Lehsun Ki Chutney",
    price: 249,
    description: `Authentic Rajasthani taste in your society.\n\nExperience the bold flavors of Rajasthan with freshly made Bajre ki Roti paired with spicy, aromatic Lehsun ki Chutney. Made with traditional recipes, pure ingredients, and homemade love.\n\nHealthy and filling\nRich in flavor\nFreshly prepared daily\n\nLimited quantity. Order now and taste real desi goodness.\nLimited plates available. Book yours now!`,
    imageLabel: "Bajre Ki Roti",
    imagePath: "assets/lehsun-chutney.jpg"
  }
];

const cart = {};

const menuGrid = document.getElementById("menuGrid");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const orderForm = document.getElementById("orderForm");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const orderStatus = document.getElementById("orderStatus");

function formatCurrency(amount) {
  if (amount === null || amount === undefined) {
    return "Price on request";
  }

  return `Rs ${amount}`;
}

function renderMenu() {
  menuGrid.innerHTML = menuItems
    .map((item) => {
      const quantity = cart[item.id] || 0;

      return `
        <article class="menu-card">
          <div class="menu-image">
            <img src="${item.imagePath}" alt="${item.name}">
            <span>${item.imageLabel}</span>
          </div>
          <div class="menu-content">
            <div class="menu-title-row">
              <h4>${item.name}</h4>
              <span class="menu-price">${formatCurrency(item.price)}</span>
            </div>
            <p>${item.description}</p>
            <div class="menu-bottom">
              <div class="qty-box">
                <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                <span class="qty-value">${quantity}</span>
                <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
              </div>
              <span>${quantity > 0 ? `${quantity} added` : "Tap to add"}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCart() {
  const selectedItems = menuItems.filter((item) => cart[item.id] > 0);
  const total = selectedItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);

  if (!selectedItems.length) {
    cartItems.innerHTML = `<p class="empty-state">No items selected yet.</p>`;
  } else {
    cartItems.innerHTML = selectedItems
      .map((item) => {
        const quantity = cart[item.id];
        const subtotal = formatCurrency(quantity * item.price);
        const unitPrice = formatCurrency(item.price);

        return `
          <div class="cart-item">
            <div class="bill-row">
              <strong>${item.name}</strong>
              <strong>${subtotal}</strong>
            </div>
            <div class="bill-row">
              <span>${quantity} x ${unitPrice}</span>
              <span>${quantity} plate${quantity > 1 ? "s" : ""}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  cartTotal.textContent = formatCurrency(total);
}

function buildOrderMessage() {
  const selectedItems = menuItems.filter((item) => cart[item.id] > 0);

  if (!selectedItems.length) {
    alert("Please select at least one food item before placing the order.");
    return null;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const deliveryAddress = document.getElementById("deliveryTime").value.trim();
  const customerNotes = document.getElementById("customerNotes").value.trim();

  if (!customerName || !customerAddress || !customerPhone || !deliveryAddress) {
    alert("Please fill your name, flat/tower, phone number, and delivery address.");
    return null;
  }

  const itemLines = selectedItems.map((item) => {
    const quantity = cart[item.id];
    return `- ${item.name} x ${quantity} = ${formatCurrency(item.price * quantity)}`;
  });

  const total = selectedItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);

  return [
    "Namaste, I want to place an order with Desi Rajasthan.",
    "",
    `Name: ${customerName}`,
    `Flat/Tower: ${customerAddress}`,
    `Phone: ${customerPhone}`,
    `Delivery Address: ${deliveryAddress}`,
    "",
    "Order Items:",
    ...itemLines,
    "",
    `Total: ${formatCurrency(total)}`,
    `Notes: ${customerNotes || "None"}`
  ].join("\n");
}

function buildOrderPayload(orderMessage) {
  return {
    customer_name: document.getElementById("customerName").value.trim(),
    flat_tower: document.getElementById("customerAddress").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    delivery_address: document.getElementById("deliveryTime").value.trim(),
    notes: document.getElementById("customerNotes").value.trim(),
    items: menuItems
      .filter((item) => cart[item.id] > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: cart[item.id],
        price: item.price,
        subtotal: item.price * cart[item.id]
      })),
    total: menuItems
      .filter((item) => cart[item.id] > 0)
      .reduce((sum, item) => sum + item.price * cart[item.id], 0),
    message: orderMessage
  };
}

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!target.matches(".qty-btn")) {
    return;
  }

  const { action, id } = target.dataset;
  const currentQuantity = cart[id] || 0;

  if (action === "increase") {
    cart[id] = currentQuantity + 1;
  } else if (action === "decrease") {
    cart[id] = Math.max(currentQuantity - 1, 0);
  }

  renderMenu();
  renderCart();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const orderMessage = buildOrderMessage();

  if (!orderMessage) {
    return;
  }

  const payload = buildOrderPayload(orderMessage);
  orderStatus.textContent = "Sending your order...";
  submitOrderBtn.disabled = true;
  submitOrderBtn.textContent = "Sending...";

  fetch("/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not send the order right now.");
      }

      orderStatus.textContent = "Order sent successfully. You will receive confirmation soon.";
      orderForm.reset();
      Object.keys(cart).forEach((key) => {
        cart[key] = 0;
      });
      renderMenu();
      renderCart();
    })
    .catch((error) => {
      orderStatus.textContent = error.message || "Could not send the order right now.";
    })
    .finally(() => {
      submitOrderBtn.disabled = false;
      submitOrderBtn.textContent = "Place Order";
    });
});

document.addEventListener("DOMContentLoaded", () => {
  try {
    orderForm.reset();
  } catch (error) {
    // Ignore reset issues in browsers that autofill aggressively.
  }
});

renderMenu();
renderCart();

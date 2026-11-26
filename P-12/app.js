// Configuration: Set USE_BACKEND_API to true once connected to your Node/PHP/Python REST API
const USE_BACKEND_API = false;
const API_URL = "http://localhost:5000/api/products";

// DOM Elements
const productForm = document.getElementById("productForm");
const tableBody = document.getElementById("inventoryTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Application State
let inventory = [];

// Security: Prevent Cross-Site Scripting (XSS) by escaping user input
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Initialize App
document.addEventListener("DOMContentLoaded", loadInventory);

// Fetch Data (Supports REST API or LocalStorage)
async function loadInventory() {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(API_URL);
      inventory = await response.json();
    } catch (error) {
      console.error("API Fetch Error:", error);
    }
  } else {
    const saved = localStorage.getItem("stockpulse_data");
    inventory = saved ? JSON.parse(saved) : [
      { id: 1, name: "Mechanical Keyboard", category: "Electronics", qty: 12, price: 2499 },
      { id: 2, name: "A4 Paper Ream", category: "Stationery", qty: 3, price: 320 }
    ];
  }
  renderTable(inventory);
}

// Save Data
async function saveToStorage() {
  if (!USE_BACKEND_API) {
    localStorage.setItem("stockpulse_data", JSON.stringify(inventory));
  }
  renderTable(inventory);
}

// Form Submission & Validation (Create & Update)
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!productForm.checkValidity()) {
    productForm.classList.add("was-validated");
    return;
  }

  const id = document.getElementById("productId").value;
  const productData = {
    id: id ? Number(id) : Date.now(),
    name: document.getElementById("productName").value.trim(),
    category: document.getElementById("productCategory").value,
    qty: Number(document.getElementById("productQty").value),
    price: Number(document.getElementById("productPrice").value)
  };

  if (id) {
    // Update existing item
    if (USE_BACKEND_API) {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } else {
      const index = inventory.findIndex(item => item.id === Number(id));
      inventory[index] = productData;
    }
  } else {
    // Create new item
    if (USE_BACKEND_API) {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } else {
      inventory.push(productData);
    }
  }

  resetForm();
  USE_BACKEND_API ? loadInventory() : saveToStorage();
});

// Render Table & Update KPI Metrics
function renderTable(items) {
  tableBody.innerHTML = "";
  let totalValue = 0;
  let lowStock = 0;

  if (items.length === 0) {
    emptyState.classList.remove("d-none");
  } else {
    emptyState.classList.add("d-none");
  }

  items.forEach(item => {
    totalValue += item.qty * item.price;
    if (item.qty < 5) lowStock++;

    const statusBadge = item.qty < 5
      ? `<span class="badge badge-low rounded-pill px-2 py-1">Low Stock</span>`
      : `<span class="badge badge-ok rounded-pill px-2 py-1">In Stock</span>`;

    const row = `
      <tr>
        <td class="fw-semibold">${sanitizeHTML(item.name)}</td>
        <td>${sanitizeHTML(item.category)}</td>
        <td>${item.qty}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>${statusBadge}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct(${item.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${item.id})">Delete</button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });

  document.getElementById("totalItems").textContent = items.length;
  document.getElementById("totalValue").textContent = `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  document.getElementById("lowStockCount").textContent = lowStock;
}

// Edit Item
window.editProduct = function(id) {
  const item = inventory.find(p => p.id === id);
  if (!item) return;

  document.getElementById("productId").value = item.id;
  document.getElementById("productName").value = item.name;
  document.getElementById("productCategory").value = item.category;
  document.getElementById("productQty").value = item.qty;
  document.getElementById("productPrice").value = item.price;

  formTitle.textContent = "Edit Product";
  submitBtn.textContent = "Update Product";
  cancelEditBtn.classList.remove("d-none");
};

// Delete Item
window.deleteProduct = async function(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  if (USE_BACKEND_API) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadInventory();
  } else {
    inventory = inventory.filter(item => item.id !== id);
    saveToStorage();
  }
};

// Search Filter
searchInput.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = inventory.filter(item =>
    item.name.toLowerCase().includes(term) ||
    item.category.toLowerCase().includes(term)
  );
  renderTable(filtered);
});

// Reset Form State
cancelEditBtn.addEventListener("click", resetForm);

function resetForm() {
  productForm.reset();
  productForm.classList.remove("was-validated");
  document.getElementById("productId").value = "";
  formTitle.textContent = "Add New Product";
  submitBtn.textContent = "Save Product";
  cancelEditBtn.classList.add("d-none");
}

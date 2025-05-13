let products = [];
let API_BASE = "https://dummyjson.com/products";

async function fetchProducts() {
  try {
    let res = await fetch(API_BASE);
    let data = await res.json();
    return data.products;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

async function addProduct(productData) {
  try {
    let res = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    return await res.json();
  } catch (error) {
    console.error("Add error:", error);
  }
}

async function updateProduct(id, productData) {
  try {
    let res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    return await res.json();
  } catch (error) {
    console.error("Update error:", error);
  }
}

function renderProducts(productList) {
  let container = document.querySelector(".products");
  container.innerHTML = productList.map(productHTML).join("");
}

function productHTML(p) {
  return `
    <div class="product" data-id="${p.id}">
      <div class="img" style="background-image: url(${
        p.images?.[0] || ""
      })"></div>

      <div class="product-view">
        <h2 class="title">${p.title}</h2>
        <p><b>Description:</b> ${p.description}</p>
        <p><b>Category:</b> ${p.category}</p>
        <p><b>Price:</b> ${p.price}$</p>
        <p><b>Discount:</b> ${p.discountPercentage}$</p>
        <p><b>Rating: </b>${p.rating}✨</p>
        <p><b>Stock:</b> ${p.stock}</p>
      </div>

      <div class="product-edit d-none">
        <input class="title" type="text" value="${
          p.title
        }" placeholder="Title" />
        <textarea placeholder="Description" rows="4">${p.description}</textarea>
        <input type="text" value="${p.category}" placeholder="Category" />
        <input type="number" value="${p.price}" placeholder="Price" />
        <input type="number" value="${
          p.discountPercentage
        }" placeholder="Discount" />
        <input type="number" value="${p.rating}" placeholder="Rating" />
        <input type="number" value="${p.stock}" placeholder="Stock" />
      </div>

      <div class="button-container">
        <button class="save-btn d-none">Save</button>
        <button class="delete-btn">Delete</button>
        <button class="edit-btn">Edit</button>
      </div>
    </div>`;
}

function showForm() {
  let addBtn = document.getElementById("showForm");
  let formOverlay = document.querySelector(".form-overlay");
  let closeBtn = document.querySelector(".form-overlay .close");
  let container = document.querySelector(".container");

  if (!addBtn || !formOverlay || !closeBtn) return;

  addBtn.addEventListener("click", () => {
    formOverlay.classList.remove("d-none");
    formOverlay.classList.add("fade-in");
    container.classList.add("d-none");
  });

  closeBtn.addEventListener("click", () => {
    hideOverlay();

    container.classList.remove("d-none");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !formOverlay.classList.contains("d-none")) {
      hideOverlay();
    }
  });

  function hideOverlay() {
    formOverlay.classList.add("fade-out");
    setTimeout(() => {
      formOverlay.classList.remove("fade-in", "fade-out");
      formOverlay.classList.add("d-none");
    }, 300);
  }
}

document.addEventListener("DOMContentLoaded", showForm);

function clearForm() {
  document
    .querySelectorAll(".input-container input")
    .forEach((i) => (i.value = ""));
}

function getFormData() {
  let inputs = document.querySelectorAll(".input-container input");
  let [title, description, category, price, discount, rating, stock, imageUrl] =
    [...inputs].map((i) => i.value);

  return {
    title,
    description,
    category,
    price: parseFloat(price),
    discountPercentage: parseFloat(discount),
    rating: parseFloat(rating),
    stock: parseInt(stock),
    imageUrl,
  };
}

function showSuccessMessage() {
  let doneMsg = document.querySelector(".form-overlay .done");
  let formOverlay = document.querySelector(".form-overlay");
  let container = document.querySelector(".container");

  if (!doneMsg || !formOverlay) return;

  formOverlay.querySelector(".add-product").classList.add("d-none");

  doneMsg.classList.remove("d-none");
  setTimeout(() => {
    doneMsg.classList.add("show");
  }, 10);

  setTimeout(() => {
    doneMsg.classList.remove("show");

    setTimeout(() => {
      doneMsg.classList.add("d-none");
      formOverlay.classList.add("fade-out");
      container.classList.remove("d-none");

      setTimeout(() => {
        formOverlay.classList.remove("fade-in", "fade-out");
        formOverlay.classList.add("d-none");
        formOverlay.querySelector(".add-product").classList.remove("d-none");
      }, 300);
    }, 500);
  }, 2000);
}

function setupForm() {
  let addBtn = document.getElementById("addBtn");
  let formTitle = document.getElementById("formTitle");

  let isEditing = false;
  let editId = null;

  addBtn.addEventListener("click", async () => {
    let data = getFormData();

    if (!data.title || !data.price || isNaN(data.price)) {
      alert("Please fill in required fields correctly.");
      return;
    }

    if (isEditing) {
      let original = products.find((p) => p.id === editId);
      let updated = await updateProduct(editId, {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        discountPercentage: data.discountPercentage,
        rating: data.rating,
        stock: data.stock,
        images: data.imageUrl ? [data.imageUrl] : original.images,
      });

      if (updated) {
        let index = products.findIndex((p) => p.id === editId);
        products[index] = { ...products[index], ...updated };
      }

      isEditing = false;
      editId = null;
      addBtn.textContent = "Add Product";
      formTitle.textContent = "Add Your Product";
    } else {
      let newProduct = await addProduct({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        discountPercentage: data.discountPercentage,
        rating: data.rating,
        stock: data.stock,
        images: data.imageUrl
          ? [data.imageUrl]
          : [
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz3mIf7riOXklE3zlfN3oCgFQJTZEBIel7Jw&s",
            ],
      });

      if (newProduct) {
        products.push(newProduct);
        showSuccessMessage();
      }
    }

    clearForm();
    renderProducts(products);
  });

  document.querySelector(".products").addEventListener("click", async (e) => {
    let target = e.target;
    let card = target.closest(".product");
    if (!card) return;

    let id = parseInt(card.dataset.id);
    let product = products.find((p) => p.id === id);
    let view = card.querySelector(".product-view");
    let edit = card.querySelector(".product-edit");
    let saveBtn = card.querySelector(".save-btn");
    let editBtn = card.querySelector(".edit-btn");

    if (target.classList.contains("delete-btn")) {
      products = products.filter((p) => p.id !== id);
      renderProducts(products);
      return;
    }

    if (target.classList.contains("edit-btn")) {
      view.classList.add("fade-out");
      setTimeout(() => {
        view.classList.add("d-none");
        edit.classList.remove("d-none");
        saveBtn.classList.remove("d-none");
        editBtn.classList.add("d-none");
      }, 300);
    }

    if (target.classList.contains("save-btn")) {
      let inputs = edit.querySelectorAll("input");
      let textarea = edit.querySelector("textarea");
      let updatedData = {
        title: inputs[0].value,
        description: textarea.value,
        category: inputs[1].value,
        price: parseFloat(inputs[2].value),
        discountPercentage: parseFloat(inputs[3].value),
        rating: parseFloat(inputs[4].value),
        stock: parseInt(inputs[5].value),
      };

      let updated = await updateProduct(id, updatedData);
      if (updated) {
        let index = products.findIndex((p) => p.id === id);
        products[index] = { ...products[index], ...updated };
        renderProducts(products);
      }
    }
  });
}

// inc and dec

function inc() {
  let sorted = [...products].sort((a, b) => a.price - b.price);
  renderProducts(sorted);
}

function dec() {
  let sorted = [...products].sort((a, b) => b.price - a.price);
  renderProducts(sorted);
}

// search functional

async function handleSearch() {
  let query = document.getElementById("searchInput").value.trim();

  if (!query) {
    renderProducts(products);
    return;
  }

  try {
    let res = await fetch(`https://dummyjson.com/products/search?q=${query}`);
    let data = await res.json();
    renderProducts(data.products);
  } catch (error) {
    console.error("Search error:", error);
  }
}

async function main() {
  products = await fetchProducts();
  renderProducts(products);
  setupForm();
}

main();

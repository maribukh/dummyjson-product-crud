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
      <h2>${p.title}</h2>
      <p>Description: ${p.description}</p>
      <p>Category: ${p.category}</p>
      <p>Price: ${p.price}</p>
      <p>Discount: ${p.discountPercentage}</p>
      <p>Rating: ${p.rating}</p>
      <p>Stock: ${p.stock}</p>
      <div class="button-container">
        <button class="delete-btn">Delete</button>
        <button class="edit-btn">Edit</button>
      </div>
    </div>`;
}

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
    imageUrl: imageUrl.trim(), 
  };
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

      if (newProduct) products.push(newProduct);
    }

    clearForm();
    renderProducts(products);
  });

  // Делегирование на кнопки Edit/Delete
  document.querySelector(".products").addEventListener("click", (e) => {
    let target = e.target;
    if (
      !target.classList.contains("edit-btn") &&
      !target.classList.contains("delete-btn")
    )
      return;

    let card = target.closest(".product");
    let id = parseInt(card.dataset.id);
    let product = products.find((p) => p.id === id);
    let inputs = document.querySelectorAll(".input-container input");

    if (target.classList.contains("delete-btn")) {
      products = products.filter((p) => p.id !== id);
      renderProducts(products);
      return;
    }

    if (target.classList.contains("edit-btn")) {
      // Заполняем форму
      [inputs[0].value, inputs[1].value, inputs[2].value] = [
        product.title,
        product.description,
        product.category,
      ];
      inputs[3].value = product.price;
      inputs[4].value = product.discountPercentage;
      inputs[5].value = product.rating;
      inputs[6].value = product.stock;
      inputs[7].value = product.images?.[0] || "";

      isEditing = true;
      editId = id;
      addBtn.textContent = "Update Product";
      formTitle.textContent = "Edit Product";
    }
  });
}

async function main() {
  products = await fetchProducts();
  renderProducts(products);
  setupForm();
}

main();

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================
// FIREBASE CONFIGURATION
// ======================================

const firebaseConfig = {

  apiKey: "AIzaSyBIzCJ7KjkBcqUp2P87T6R0ulxsWPfKdBc",
  authDomain: "prac-ad8a1.firebaseapp.com",
  projectId: "prac-ad8a1",
  storageBucket: "prac-ad8a1.firebasestorage.app",
  messagingSenderId: "133228326945",
  appId: "1:133228326945:web:61ad4fe963c9c9ece03360"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ======================================
// VARIABLES
// ======================================

const productForm = document.getElementById("productForm");

const productTable = document.getElementById("productTable");

const searchInput = document.getElementById("searchInput");

let products = [];


// ======================================
// ADD PRODUCT
// ======================================

productForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const productName =
        document.getElementById("productName").value.trim();

    const sku =
        document.getElementById("sku").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const quantity =
        Number(document.getElementById("quantity").value);

    const price =
        Number(document.getElementById("price").value);


    try {

        await addDoc(collection(db, "products"), {

            productName: productName,

            sku: sku,

            category: category,

            quantity: quantity,

            price: price,

            createdAt: new Date()

        });


        alert("Product added successfully!");

        productForm.reset();

        loadProducts();

    } catch (error) {

        console.error("Error adding product:", error);

        alert("Could not add product.");

    }

});


// ======================================
// LOAD PRODUCTS
// ======================================

async function loadProducts() {

    try {

        const querySnapshot =
            await getDocs(collection(db, "products"));

        products = [];

        querySnapshot.forEach((document) => {

            products.push({

                id: document.id,

                ...document.data()

            });

        });


        displayProducts(products);

        updateDashboard();

    } catch (error) {

        console.error("Error loading products:", error);

    }

}


// ======================================
// DISPLAY PRODUCTS
// ======================================

function displayProducts(productList) {

    productTable.innerHTML = "";


    if (productList.length === 0) {

        productTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No products found.
                </td>
            </tr>
        `;

        return;

    }


    productList.forEach((product) => {

        const value =
            product.quantity * product.price;


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${product.productName}</td>

            <td>${product.sku}</td>

            <td>${product.category}</td>

            <td class="${product.quantity <= 5 ? "low-stock" : ""}">
                ${product.quantity}
            </td>

            <td>
                ${formatCurrency(product.price)}
            </td>

            <td>
                ${formatCurrency(value)}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editProduct('${product.id}')"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteProduct('${product.id}')"
                >
                    Delete
                </button>

            </td>
        `;


        productTable.appendChild(row);

    });

}


// ======================================
// DELETE PRODUCT
// ======================================

window.deleteProduct = async function(id) {

    const confirmation =
        confirm("Are you sure you want to delete this product?");


    if (!confirmation) {
        return;
    }


    try {

        await deleteDoc(doc(db, "products", id));

        alert("Product deleted.");

        loadProducts();

    } catch (error) {

        console.error("Error deleting product:", error);

        alert("Could not delete product.");

    }

};


// ======================================
// EDIT PRODUCT
// ======================================

window.editProduct = async function(id) {

    const product =
        products.find((item) => item.id === id);


    if (!product) {
        return;
    }


    const newName =
        prompt("Product name:", product.productName);

    if (newName === null) {
        return;
    }


    const newQuantity =
        prompt("Quantity:", product.quantity);

    if (newQuantity === null) {
        return;
    }


    const newPrice =
        prompt("Price:", product.price);

    if (newPrice === null) {
        return;
    }


    try {

        await updateDoc(
            doc(db, "products", id),
            {

                productName: newName,

                quantity: Number(newQuantity),

                price: Number(newPrice)

            }
        );


        alert("Product updated successfully!");

        loadProducts();

    } catch (error) {

        console.error("Error updating product:", error);

        alert("Could not update product.");

    }

};


// ======================================
// SEARCH
// ======================================

searchInput.addEventListener("input", () => {

    const searchTerm =
        searchInput.value.toLowerCase();


    const filteredProducts =
        products.filter((product) =>

            product.productName
                .toLowerCase()
                .includes(searchTerm)

            ||

            product.sku
                .toLowerCase()
                .includes(searchTerm)

            ||

            product.category
                .toLowerCase()
                .includes(searchTerm)

        );


    displayProducts(filteredProducts);

});


// ======================================
// DASHBOARD
// ======================================

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) =>
                total + Number(product.quantity),
            0
        );


    const lowStock =
        products.filter(
            product => Number(product.quantity) <= 5
        ).length;


    const inventoryValue =
        products.reduce(
            (total, product) =>
                total +
                Number(product.quantity) *
                Number(product.price),
            0
        );


    document.getElementById("totalProducts")
        .textContent = totalProducts;


    document.getElementById("totalStock")
        .textContent = totalStock;


    document.getElementById("lowStock")
        .textContent = lowStock;


    document.getElementById("inventoryValue")
        .textContent = formatCurrency(inventoryValue);

}


// ======================================
// CURRENCY FORMAT
// ======================================

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-RW", {

        style: "currency",

        currency: "RWF",

        maximumFractionDigits: 0

    }).format(amount);

}


// ======================================
// START APPLICATION
// ======================================

loadProducts();
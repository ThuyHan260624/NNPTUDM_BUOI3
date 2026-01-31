// API Configuration
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// State Management
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let sortConfig = {
    column: null,
    direction: 'asc' // 'asc' or 'desc'
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const tableBody = document.getElementById('tableBody');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const loadingIndicator = document.getElementById('loadingIndicator');
const sortButtons = document.querySelectorAll('.sort-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    getAll();
    setupEventListeners();
});

/**
 * Fetch all products from API
 * This is the main getAll function for the dashboard
 */
async function getAll() {
    showLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        allProducts = await response.json();
        console.log('Products loaded:', allProducts);
        if (allProducts.length > 0) {
            console.log('First product:', allProducts[0]);
            console.log('First product images:', allProducts[0].images);
        }
        filteredProducts = [...allProducts];
        currentPage = 1;
        renderTable();
        showLoading(false);
    } catch (error) {
        console.error('Error fetching products:', error);
        showLoading(false);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: red;">
                    Lỗi: Không thể tải dữ liệu. Vui lòng thử lại sau.
                </td>
            </tr>
        `;
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterProducts(searchTerm);
    });

    // Items per page change
    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });

    // Pagination buttons
    prevBtn.addEventListener('click', previousPage);
    nextBtn.addEventListener('click', nextPage);

    // Sort buttons
    sortButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sortColumn = btn.dataset.sort;
            handleSort(sortColumn);
        });
    });
}

/**
 * Filter products by search term
 */
function filterProducts(searchTerm) {
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm)
        );
    }
    currentPage = 1;
    renderTable();
}

/**
 * Handle sorting of products
 */
function handleSort(column) {
    // If clicking the same column, toggle direction
    if (sortConfig.column === column) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.column = column;
        sortConfig.direction = 'asc';
    }

    sortProducts();
    currentPage = 1;
    renderTable();
}

/**
 * Sort products based on current sort configuration
 */
function sortProducts() {
    filteredProducts.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.column === 'title') {
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            return sortConfig.direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        } else if (sortConfig.column === 'price') {
            aValue = parseFloat(a.price);
            bValue = parseFloat(b.price);
            return sortConfig.direction === 'asc'
                ? aValue - bValue
                : bValue - aValue;
        }

        return 0;
    });
}

/**
 * Render the table with current page data
 */
function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredProducts.slice(startIndex, endIndex);

    // Clear table body
    tableBody.innerHTML = '';

    if (pageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    Không tìm thấy sản phẩm nào
                </td>
            </tr>
        `;
        updatePaginationControls();
        return;
    }

    // Add rows
    pageData.forEach((product, index) => {
        const row = createTableRow(product, startIndex + index + 1);
        tableBody.appendChild(row);
    });

    updatePaginationControls();
}

/**
 * Create a table row for a product
 */
function createTableRow(product, rowNumber) {
    const tr = document.createElement('tr');
    
    // Handle image from API - images is an array of URLs
    let imageUrl = 'https://via.placeholder.com/100?text=No+Image';
    
    console.log('Product:', product.id, product.title);
    console.log('Product images array:', product.images);
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // Get the first image URL
        const firstImage = product.images[0];
        console.log('First image:', firstImage);
        imageUrl = firstImage.trim();
        // Ensure it's a valid URL
        if (!imageUrl || !imageUrl.startsWith('http')) {
            console.log('Invalid image URL, using placeholder');
            imageUrl = 'https://via.placeholder.com/100?text=No+Image';
        }
    } else {
        console.log('No images found for product', product.id);
    }
    
    const description = product.description || 'Chưa có mô tả';

    tr.innerHTML = `
        <td>${product.id}</td>
        <td class="image-cell">
            <img src="${imageUrl}" alt="${product.title}" class="product-image loading" 
                 crossorigin="anonymous"
                 referrerpolicy="no-referrer"
                 onload="this.classList.remove('loading')"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2212%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'; this.classList.remove('loading');">
        </td>
        <td>${product.title}</td>
        <td>
            <div class="description-cell">
                <span class="description-placeholder">Hover để xem</span>
                <div class="description-text">${description}</div>
            </div>
        </td>
        <td><span class="price">${formatPrice(product.price)}</span></td>
        <td>
            <span class="category">${product.category?.name || 'Khác'}</span>
        </td>
    `;

    return tr;
}

/**
 * Format price with currency
 */
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

/**
 * Update pagination controls
 */
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Update page info
    if (filteredProducts.length === 0) {
        pageInfo.textContent = 'Không có dữ liệu';
    } else {
        pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
    }

    // Enable/Disable prev button
    prevBtn.disabled = currentPage === 1;

    // Enable/Disable next button
    nextBtn.disabled = currentPage >= totalPages || filteredProducts.length === 0;
}

/**
 * Go to previous page
 */
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        window.scrollTo(0, 0);
    }
}

/**
 * Go to next page
 */
function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        window.scrollTo(0, 0);
    }
}

/**
 * Show/Hide loading indicator
 */
function showLoading(show) {
    if (show) {
        loadingIndicator.classList.add('active');
    } else {
        loadingIndicator.classList.remove('active');
    }
}

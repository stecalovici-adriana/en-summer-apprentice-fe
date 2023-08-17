// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}

// HTML templates
function getHomePageTemplate() {
  return `
    <div id="content" >
      <img src="./src/assets/image.jpeg" alt="summer">
      <div class="events flex items-center justify-center flex-wrap">
      </div>
    </div>
  `;
}


function getOrdersPageTemplate() {
  return `
    <div id="content" class="black-background">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
      <div class="sort-buttons">
        <button class="btn btn-sort" id="sortAscendingBtn">Sort Ascending By Price</button>
        <button class="btn btn-sort" id="sortDescendingBtn">Sort Descending By Price</button>
      </div>
      <div class="orders"></div>
    </div>
  `;
}

function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });
}

function setupMobileMenuEvent() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupPopstateEvent() {
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname;
    renderContent(currentUrl);
    setupSortButtons(); // Adăugați această linie pentru a re-atașa evenimentele de sortare
  });
}

function setupSortButtons() {
  const sortAscendingBtn = document.getElementById('sortAscendingBtn');
  sortAscendingBtn.addEventListener('click', () => {
    sortOrders(true);
  });

  const sortDescendingBtn = document.getElementById('sortDescendingBtn');
  sortDescendingBtn.addEventListener('click', () => {
    sortOrders(false);
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);

  const sortAscendingBtn = document.getElementById('sortAscendingBtn');
  const sortDescendingBtn = document.getElementById('sortDescendingBtn');

  if (sortAscendingBtn && sortDescendingBtn) {
    setupSortButtons(); 
  }
  
}


async function renderOrders() {
  const ordersData = await fetchOrders();
  const ordersContainer = document.querySelector('.orders');
  
  // Golește containerul de comenzilor existente
  ordersContainer.innerHTML = '';

  // Iterează prin comenzile sortate și adaugă-le la container
  for (const orderData of ordersData) {
    const orderRow = await renderOrderRow(orderData);
    ordersContainer.appendChild(orderRow);
  }
}

async function sortOrders(ascending) {
  const ordersData = await fetchOrders();
  ordersData.sort((a, b) => {
    return ascending ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
  });

  const ordersTable = document.querySelector('.orders-table tbody');
  ordersTable.innerHTML = ''; // Clear the existing table body

  for (const orderData of ordersData) {
    const orderRow = await renderOrderRow(orderData);
    ordersTable.appendChild(orderRow); // Append the sorted rows to the existing table body
  }
}

async function renderHomePage(eventsData) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

  console.log('function', fetchTicketEvents());
  fetchTicketEvents().then((data)=>{
    console.log('data', data);
  })

  const eventsContainer = document.querySelector('.events');

  const eventImages = [
    'src/assets/untold.jpg',
    'src/assets/electric.jpg',
    'src/assets/football.jpg',
    'src/assets/wine.jpg',
  ];
  

  eventsData.forEach((eventData, index) => {
    const eventCard = document.createElement('div');
    eventCard.classList.add('event-card');
    console.log('bbbbb', eventData)

    const eventImage = eventImages[index];

    const contentMarkup = `
  <header>
    <h2 class="event-title text-2xl font-bold">${eventData.eventName}</h2>
  </header>
  <div class="content-event">
  <img src="${eventImage}" alt="${eventData.eventName}" class="event-image">
    <p class="description text-gray-700">${eventData.eventDescription}</p>
    <div class="ticket-section">
      <p class="ticket-type-text">Choose Ticket Type:</p>
      <select class="ticket-type-${eventData.eventID} bg-white border border-gray-300 px-2 py-1 rounded mt-2">
        <option value="${eventData.ticketCategory[0].ticketCategoryId}">${eventData.ticketCategory[0].description}</option>
        <option value="${eventData.ticketCategory[1].ticketCategoryId}">${eventData.ticketCategory[1].description}</option>
      </select>
      <div class="quantity">
        <button class="quantity-btn decrease">-</button>
        <input type="number" class="ticket-quantity" value="1" min="1">
        <button class="quantity-btn increase">+</button>
      </div>
      <button class="buy-button bg-blue-500 text-white px-4 py-2 rounded mt-2" id="buyTicketsBtn">Buy Tickets</button>
    </div>
  </div>
`;


    eventCard.innerHTML = contentMarkup;
    eventsContainer.appendChild(eventCard);

    const buyTicketsButton = eventCard.querySelector('#buyTicketsBtn');
    const quantityInput = eventCard.querySelector('.ticket-quantity');

    buyTicketsButton.addEventListener('click', async () => 
    {
     const ticketCategorySelect= document.querySelector(`.ticket-type-${eventData.eventID}`);
     
      const ticketCategoryID = parseInt(ticketCategorySelect.value);
      const eventID = eventData.eventID; // ID-ul evenimentului
      const numberOfTickets = parseInt(quantityInput.value);
console.log('aaaa', eventID);

      const orderData = {
        ticketCategoryId:+ticketCategoryID,
        eventId:+eventID,
        numberOfTickets:+numberOfTickets
      };
console.log(orderData);
      try {
        const response = await placeOrder(orderData);
        console.log('Order placed:', response);
      } catch (error) {
        console.error('Error placing order:', error);
      }
    });


  });
  setupQuantityButtons();


}


async function fetchTicketEvents() {
  const response = await fetch('https://localhost:7245/api/Event/GetAll');
  const data = await response.json();
  return data;
}

async function fetchOrders() {
  const response = await fetch('https://localhost:7245/api/Order/GetAll');
  const orders = await response.json();
  console.log("sjefsf", orders);
  orders.forEach(order => {
    order.totalPrice = parseFloat(order.totalPrice);
  });

  return orders;

}

async function placeOrder(orderData) {
  const url = 'http://localhost:8080/createOrder'; // Replace with your actual API endpoint
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
    },
    body: JSON.stringify(orderData), 
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Network response was not ok: ${response.status} - ${errorMessage}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

 

const orderData = {
  "ticketCategoryId": 1,
  "eventId": 1,
  "numberOfTickets": 2
};

placeOrder(orderData).then(data => {
  console.log('Order placed:', data);
});

function setupQuantityButtons() {
  const decreaseBtns = document.querySelectorAll('.quantity-btn.decrease');
  const increaseBtns = document.querySelectorAll('.quantity-btn.increase');
  const quantityInputs = document.querySelectorAll('.ticket-quantity');

  decreaseBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (quantityInputs[index].value > 1) {
        quantityInputs[index].value--;
      }
    });
  });

  increaseBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      quantityInputs[index].value++;
    });
  });
}

async function patchOrders(orderID, numberOfTickets, ticketCategoryID) {
  const url = `https://localhost:7245/api/Order/Patch`; // Update with the correct URL
  const patchData = {
    orderId: orderID,
    numberOfTickets: numberOfTickets,
    ticketCategoryId: ticketCategoryID
  };

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchData)
    });

    if (!response.ok) {
      throw new Error(`Patch request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error patching order:', error);
    throw error;
  }
}


async function renderOrderRow(orderData) {
  const orderRow = document.createElement('tr');
  orderRow.classList.add('order-row');
  const contentMarkup = `
  <td class="order-details">${orderData.orderID}</td>
  <td class="order-details">${orderData.orderedAt}</td>
  <td class="order-details">${orderData.ticketCategory}</td>
  <td class="order-details">
      <span class="ticket-count">${orderData.numberOfTickets}</span>
      <input type="number" class="input-ticket-count" value="${orderData.numberOfTickets}" style="display: none;">
    </td>
  <td class="order-details">${orderData.totalPrice}</td>
  <td class="order-actions">
    <button class="btn btn-modify">Modify</button>
    <button class="btn btn-delete">Delete</button>
    <button class="btn btn-save" style="background-color: green;" hidden>Save</button>
    <button class="btn btn-cancel" style="background-color: red;" hidden>Cancel</button>
  </td>
`;

orderRow.innerHTML = contentMarkup;
  const modifyButton = orderRow.querySelector('.btn-modify');
  const deleteButton = orderRow.querySelector('.btn-delete');
  const saveButton = orderRow.querySelector('.btn-save');
  const cancelButton = orderRow.querySelector('.btn-cancel');
  const ticketCountDisplay = orderRow.querySelector('.ticket-count');
  const inputTicketCount = orderRow.querySelector('.input-ticket-count');

  modifyButton.addEventListener('click', () => {
    modifyButton.style.display = 'none';
    deleteButton.style.display = 'none';
    saveButton.style.display = 'inline';
    cancelButton.style.display = 'inline';

    ticketCountDisplay.style.display = 'none';
    inputTicketCount.style.display = 'inline';
  });

  saveButton.addEventListener('click', () => {
    const newTicketCount = inputTicketCount.value;
    // Aici poți adăuga cod pentru a actualiza numărul de bilete în obiectul orderData sau în altă parte
    ticketCountDisplay.textContent = newTicketCount;

    modifyButton.style.display = 'inline';
    deleteButton.style.display = 'inline';
    saveButton.style.display = 'none';
    cancelButton.style.display = 'none';

    ticketCountDisplay.style.display = 'inline';
    inputTicketCount.style.display = 'none';
  });

  cancelButton.addEventListener('click', () => {
    modifyButton.style.display = 'inline';
    deleteButton.style.display = 'inline';
    saveButton.style.display = 'none';
    cancelButton.style.display = 'none';

    ticketCountDisplay.style.display = 'inline';
    inputTicketCount.style.display = 'none';
  });

  deleteButton.addEventListener('click', async () => {
    const result = await deleteEventById(orderData.orderID);
    if (result.success) {
      // Dacă ștergerea a fost cu succes, reîncărcați pagina pentru a reflecta modificările
      renderOrdersPage();
    } else {
      console.error('Error deleting order:', result.message);
    }
  });

  //orderRow.innerHTML = contentMarkup;
  return orderRow;
}

async function deleteEventById(orderID) {

  try {
    const response = await fetch(`https://localhost:7245/api/Order/Delete?id=${orderID}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      return { success: true, message: 'Order deleted successfully.' };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, message: 'An error occurred while deleting the order.' };
  }
}

async function renderOrdersPage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();

  const ordersData = await fetchOrders();

  const ordersTable = document.createElement('table');
  ordersTable.classList.add('orders-table');

  const tableHeaderMarkup = `
  <thead>
    <tr>
      <th>Order ID</th>
      <th>Date</th>
      <th>Ticket Category</th>
      <th>Number of Tickets</th>
      <th>Total Price</th>
      <th>Actions</th>
    </tr>
  </thead>
  `;

ordersTable.innerHTML = tableHeaderMarkup;

  const tableBody = document.createElement('tbody');
  console.log("OrdersData",orderData);
  for (const orderData of ordersData) {
    const orderRow = await renderOrderRow(orderData);
    tableBody.appendChild(orderRow);
  }

  ordersTable.appendChild(tableBody);
  mainContentDiv.appendChild(ordersTable);

  setupSortButtons();
}



// Render content based on URL
async function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  if (url === '/') {
    const eventsData = await fetchTicketEvents();
    renderHomePage(eventsData);
  } else if (url === '/orders') {
    renderOrdersPage();
  }
}

// Call the setup functions
document.addEventListener('DOMContentLoaded', () => {
  setupNavigationEvents();
  setupMobileMenuEvent();
  setupPopstateEvent();
  setupInitialPage();
  setupSortButtons();
});
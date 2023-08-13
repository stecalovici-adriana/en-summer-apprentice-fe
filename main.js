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
    <div id="content">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
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
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);
}

async function fetchTicketEvents() {
  const response = await fetch('https://localhost:7245/api/Event/GetAll');
  const data = await response.json();
  return data;
}



async function placeOrder(orderData) {

  const url = 'http://localhost:8080/createOrder'; // Replace with your actual API endpoint

  const options = {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json', // Set the appropriate content type

      // Add any additional headers if needed

    },

    body: JSON.stringify(orderData), // Convert your data to JSON

  };

 

  try {

    const response = await fetch(url, options);

    if (!response.ok) {

      const errorMessage = await response.text(); // Get the error message from the response body

      throw new Error(`Network response was not ok: ${response.status} - ${errorMessage}`);

    }

    const data = await response.json();

    return data;

  } catch (error) {

    console.error('Fetch error:', error);

  }

}

 

// Example order data

const orderData = {

  "ticketCategoryId": 1,

  "eventId": 1,

  "numberOfTickets": 2

};

 

// Call the placeOrder function with the order data

placeOrder(orderData).then(data => {

  console.log('Order placed:', data);

  // Process the response data as needed

});


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
  <div class="content">
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
     const ticketCategorySelect= document.querySelector(`.ticket-type-${eventData.eventID}`);//-${eventData.eventId}
     const selectedTicketCategory=ticketCategorySelect.value;
     
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
function renderOrdersPage(categories) { //fara param
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();
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
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();
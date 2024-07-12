const searchBtnEl = document.getElementById("searchBtn");
const searchForm = document.getElementById("search-form");
const eventCityEl = document.getElementById("eventCity");
const eventStateEl = document.getElementById("eventState");
const eventTypeEl = document.getElementById("eventType");
const pErrorMsgEl = document.getElementById("errorMsg");
const usStates = ["AK", "AL", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
    "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY",
    "AE", "AA", "AP"];
const gApiKey = "AIzaSyAjEdX6S_xFQigVRScAJn6tIFbdu_18lzA"
const ticketMasterApiKey = "NKLwGZ8Q2Ia64tUfDRcaU1AUZ0ChUWGW"


// <----- Helper Methods ----->
function storeToLocalStorage(eventsArr) {
    console.log("Storing the below info to localstorage");
    console.log(eventsArr);
    localStorage.setItem("events", JSON.stringify(eventsArr));
}

// Helper method to read from local storage.
function readFromLocalStorage() {
    return JSON.parse(localStorage.getItem("events"));
}

// Helper method to render results.
const resultsContainerEl = document.getElementById('eventResultsContainer');

function renderResults() {
    // Get events from localStorage
    const events = readFromLocalStorage();
    resultsContainerEl.innerHTML = '';

    // Loop through events and render a card for each event
    if (events) {
        for (const event of events) {
            renderCard(event);
        }
    }
}

// Helper method to create results card
function renderCard(eventObj) {
    // Results card
    const cardEl = document.createElement('div');
    cardEl.setAttribute('class', 'p-5 mb-5');
    cardEl.style.border = '2px solid black';
    cardEl.style.position = 'relative';
    // Main row
    const mainRowEl = document.createElement('div');
    mainRowEl.setAttribute('class', 'is-flex is-flex-direction-row mb-4');

    // Thumbnail
    const thumbnailEl = document.createElement('div');
    thumbnailEl.style.backgroundImage = `url(${eventObj.thumbnail})`;
    thumbnailEl.style.backgroundSize = 'cover';
    thumbnailEl.style.height = '150px';
    thumbnailEl.style.width = '150px';
    thumbnailEl.setAttribute('class', 'mr-5');
    mainRowEl.append(thumbnailEl);

    // Main Info container
    const mainInfoContainerEl = document.createElement('div');
    mainRowEl.append(mainInfoContainerEl);

    // Title
    const titleEl = document.createElement('h3');
    titleEl.textContent = eventObj.title;
    titleEl.setAttribute('class', 'mb-2');
    titleEl.style.fontWeight = 'bold';
    titleEl.style.fontSize = '175%';
    mainInfoContainerEl.append(titleEl);

    // Info
    const infoEl = document.createElement('div');
    const dateEl = document.createElement('p');
    dateEl.textContent = 'Date & Time: ' + (new Date(eventObj.dateTime)).toLocaleString();
    const addressEl = document.createElement('p');
    addressEl.textContent = 'Address: ' + eventObj.address;
    infoEl.append(dateEl, addressEl);
    mainInfoContainerEl.append(infoEl);

    // Bottom row
    const bottomRow = document.createElement('div');
    bottomRow.setAttribute('class', 'is-flex is-flex-direction-row is-justify-content-space-between is-align-items-flex-end');

    // Source
    const sourceEl = document.createElement('img');
    sourceEl.src = './assets/images/ticketmaster-logo.png';
    sourceEl.style.height = '20px';
    sourceEl.style.width = '20px';
    bottomRow.append(sourceEl);

    // More info
    const moreInfoEl = document.createElement('span');
    moreInfoEl.textContent = 'More Info';
    moreInfoEl.classList.add('more-info-link');
    moreInfoEl.addEventListener('click', (event) => handleMoreInfoButtonClick(event, eventObj)); // Call openModal function and pass eventObj
    bottomRow.append(moreInfoEl);

    // Append info to card and append card to results container
    cardEl.append(mainRowEl, bottomRow);
    resultsContainerEl.append(cardEl);
}

function handleMoreInfoButtonClick(event, eventObj) {
    //Implement opening modal
    const modal = document.getElementById('eventModal');
    const modalContentEl = modal.querySelector('.box');

    // Clear previous content
    modalContentEl.innerHTML = '';

    // Title
    const titleEl = document.createElement('h3');
    titleEl.classList.add('title');
    titleEl.id = 'modalTitle';
    titleEl.textContent = eventObj.title;
    modalContentEl.appendChild(titleEl);

    // Added horizontal line after title
    const hrEl = document.createElement('hr');
    modalContentEl.appendChild(hrEl);

    // Date and Time
    const dateEl = document.createElement('p');
    dateEl.id = 'modalDate';
    const dateLabel = document.createElement('span');
    dateLabel.style.fontWeight = 'bold';
    dateLabel.textContent = 'Date & Time: ';
    dateEl.appendChild(dateLabel);
    dateEl.append(new Date(eventObj.dateTime).toLocaleString());
    modalContentEl.appendChild(dateEl);

    // Venue
    const venueEl = document.createElement('p');
    venueEl.id = 'modalVenue';
    const venueLabel = document.createElement('span');
    venueLabel.style.fontWeight = 'bold';
    venueLabel.textContent = 'Venue: ';
    venueEl.appendChild(venueLabel);
    venueEl.append(eventObj.address);
    modalContentEl.appendChild(venueEl);

    // Price Range
    const priceRangeEl = document.createElement('p');
    priceRangeEl.id = 'modalPriceRange';
    const priceRangeLabel = document.createElement('span');
    priceRangeLabel.style.fontWeight = 'bold';
    priceRangeLabel.textContent = 'Price Range: ';
    priceRangeEl.appendChild(priceRangeLabel);
    priceRangeEl.append(eventObj.pricerange);
    modalContentEl.appendChild(priceRangeEl);

    // Event Link
    const linkEl = document.createElement('p');
    linkEl.id = 'modalLink';
    linkEl.innerHTML = `<a href="${eventObj.link}" target="_blank">Event Link</a>`;
    modalContentEl.appendChild(linkEl);

    // Added horizontal line after Event Link
    const hrEl2 = document.createElement('hr');
    modalContentEl.appendChild(hrEl2);

    // Description
    const descriptionEl = document.createElement('p');
    descriptionEl.id = 'modalDescription';
    descriptionEl.textContent = ` ${eventObj.info}`;
    modalContentEl.appendChild(descriptionEl);

    // Show the modal
    modal.classList.add('is-active');

    // Close the modal when the background or close button is clicked
    modal.querySelector('.modal-background').addEventListener('click', () => modal.classList.remove('is-active'));
    modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('is-active'));

}

// Helper method to query events from ticket master and render it.
function queryAndRenderEventsFromTicketMaster(eventType, eventCity, eventState) {
    if (eventType === "") {
        eventType = "events";
    }
    let queryString = `${eventType}+${eventCity}+${eventState}`;
    console.log(queryString);
    const ticketMstrApi = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ticketMasterApiKey}
                            &city=${eventCity}&stateCode=${eventState}&keyword=${eventType}&size=10&radius=500`;
    console.log(`Invoking api: ${ticketMstrApi} to get list of events from TicketMaster!`);
    fetch(ticketMstrApi)
        .then(function (response) {
            console.log("response");
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            const eventsData = [];
            if ('_embedded' in data) {
                const eventsResponse = data._embedded.events;
                console.log("Response from ticketmaster api call");
                console.log(eventsResponse);
                for (d of eventsResponse) {
                    const eventInfo = {
                        title: d.name,
                        dateTime: d.dates.start.dateTime,
                        info: "",
                        pricerange: "Free",
                        thumbnail: d.images[0].url,
                        source: "ticketmaster",
                        link: "",
                        address: ""
                    }
                    if ("_embedded" in d && "venues" in d._embedded) {
                        eventInfo.link = d._embedded.venues[0].url;
                        eventInfo.address = d._embedded.venues[0].address.line1 + `, ${eventCity}, ${eventState}`;
                    }

                    if ("info" in d) {
                        eventInfo.info = d.info;
                    }

                    if ("priceRanges" in d) {
                        const priceData = d.priceRanges[0];
                        let pInfoStr = ""
                        if (("min" in priceData) && ("max" in priceData)) {
                            pInfoStr = priceData.min + " - " + priceData.max + " USD";
                        } else if ("min" in priceData) {
                            pInfoStr = priceData.min + "USD";
                        } else if ("max" in priceData) {
                            pInfoStr = priceData.max + "USD";
                        }
                        eventInfo.pricerange = pInfoStr;
                    }

                    eventsData.push(eventInfo);
                }
                storeToLocalStorage(eventsData);
            }

            renderResults();
            // clear input fields
            // Commenting this as it deletes the entries on page load.
            // eventCityEl.value = "";
            // eventTypeEl.value = "";
            // eventStateEl.value = "";
        });

}

// Method to validate that the event city field is not empty.
function validateFieldsAreNotEmpty() {
    if (eventCityEl.value === "") {
        pErrorMsgEl.textContent = "Event city is a required field!"
        pErrorMsgEl.style.display = "block";
        pErrorMsgEl.style.color = "red";
        return false;
    }
    return true;
}

//TODO: Bulma styling ?
function populateUsStates() {
    const eventStateEl = document.getElementById("eventState");
    for (s of usStates) {
        const optionEl = document.createElement("option");
        optionEl.textContent = s;
        optionEl.value = s;
        eventStateEl.appendChild(optionEl);
    }
}

// <----- Event Call backs ---->
// Call back function for the search button
function handleSearchFormSubmit(event) {
    event.preventDefault();
    if (validateFieldsAreNotEmpty()) {
        queryAndRenderEventsFromTicketMaster(eventTypeEl.value, eventCityEl.value, eventStateEl.value);
    }

}

// Call back function to clear the error msg when user click on any of the input boxes
function handleFormFieldsClick() {
    pErrorMsgEl.textContent = ""
    pErrorMsgEl.style.display = "none";
}

function initWindowFunction() {
    // empty localstorage
    storeToLocalStorage([]);
    // populate the drop down button with the US states
    populateUsStates();

    // Get current location - lat/lng
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log(`Current location points to: lat:${lat} and lng: ${lng}`);
            const gReverseGeoCodingApi = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&sensor=true&key=${gApiKey}`;
            console.log(`Invoking reverse geocoding api: ${gReverseGeoCodingApi} to fetch the city and state from the co-ordinates`);
            fetch(gReverseGeoCodingApi)
                .then(function (response) {
                    console.log("response");
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    const address = data.results[0].formatted_address;
                    const addressFields = address.split(",");
                    const curCity = addressFields[0].trim();
                    const curState = addressFields[1].trim().split(" ")[0];
                    console.log(`Got back current city as: ${curCity} and state as: ${curState}. Rendering events .. `);
                    eventCityEl.value = curCity;
                    eventStateEl.value = curState;
                    queryAndRenderEventsFromTicketMaster("events", curCity, curState);
                });

        });
    }
    // TODO: What msg to print if user does not enable  gelocatuon
}


// <----- Event Listeners ----->
searchForm.addEventListener('submit', handleSearchFormSubmit);

document.querySelectorAll('.formControls').forEach(el => {
    el.addEventListener("click", handleFormFieldsClick);
});

window.onload = initWindowFunction;

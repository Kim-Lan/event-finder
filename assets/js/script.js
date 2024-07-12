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
const serpApiKey = "af555a8a7c8af6987d6427b41ff356f39d314c26a3634c1f5563a0fa171288fd"
const ticketMasterApiKey = "NKLwGZ8Q2Ia64tUfDRcaU1AUZ0ChUWGW"


// <----- Helper Methods ----->
function storeToLocalStorage(eventsArr) {
    console.log("Storing the below info to localstorage");
    console.log(eventsArr);
    localStorage.setItem("events", JSON.stringify(eventsArr));
}

function readFromLocalStorage() {
    return JSON.parse(localStorage.getItem("events"));
}

const resultsContainerEl = document.getElementById('eventResultsContainer');

function renderResults() {
    // Get events from localStorage
    const events = readFromLocalStorage();
    resultsContainerEl.innerHTML = '';

    // Create Google button
    const googleBtn = document.createElement('button');
    googleBtn.setAttribute('class', 'button mb-5');

    // Add Google Icon
    googleBtn.textContent = `Search Events in ${eventCityEl.value} on Google`;
    const googleIcon = document.createElement('img');
    googleIcon.src = './assets/images/google-logo.png';
    googleIcon.style.width = '24px';
    googleIcon.style.height = '24px';
    googleIcon.classList.add('mr-4');
    googleBtn.prepend(googleIcon);
    resultsContainerEl.append(googleBtn);

    // Loop through events and render a card for each event
    for (const event of events) {
        renderCard(event);
    }
}

function handleGoogleButtonClick(event) {
    
}
  
function renderCard(eventObj) {
    // Results card
    const cardEl = document.createElement('div');
    cardEl.setAttribute('class', 'p-5 mb-5 has-background-light has-text-dark');
    // cardEl.style.border = '2px solid var(--bulma-dark)';
    cardEl.style.borderRadius = '10px';
  
    // Main row
    const mainRowEl = document.createElement('div');
    mainRowEl.setAttribute('class', 'is-flex is-flex-direction-row mb-4');
  
    // Thumbnail
    const thumbnailEl = document.createElement('div');
    thumbnailEl.style.backgroundImage = `url(${eventObj.thumbnail})`;
    thumbnailEl.style.backgroundSize = 'cover';
    thumbnailEl.style.backgroundPosition = 'center';
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
    dateEl.innerHTML = `<b>Date & Time:</b> ${(new Date (eventObj.dateTime))
        .toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        })}`;
    const addressEl = document.createElement('p');
    addressEl.innerHTML = `<b>Address:</b> ${eventObj.address}`;
    infoEl.append(dateEl, addressEl);
    mainInfoContainerEl.append(infoEl);
  
    // Bottom row
    const bottomRow = document.createElement('div');
    bottomRow.setAttribute('class', 'is-flex is-flex-direction-row is-justify-content-space-between is-align-items-flex-end');
  
    // Source
    const sourceLinkEl = document.createElement('a');
    sourceLinkEl.href = eventObj.link ? eventObj.link : 'https://www.ticketmaster.com';
    const sourceEl = document.createElement('img');
    sourceEl.src = './assets/images/ticketmaster-logo.png';
    sourceEl.style.height = '20px';
    sourceEl.style.width = '20px';
    sourceLinkEl.append(sourceEl);
    bottomRow.append(sourceLinkEl);
  
    // More info
    const moreInfoEl = document.createElement('button');
    moreInfoEl.textContent = 'More Info';
    moreInfoEl.setAttribute('class', 'button');
    moreInfoEl.style.width = '125px';
    moreInfoEl.addEventListener('click', (event) => handleMoreInfoButtonClick(event, eventObj)); // Call openModal function and pass eventObj
    bottomRow.append(moreInfoEl);
  
    // Append info to card and append card to results container
    cardEl.append(mainRowEl, bottomRow);
    resultsContainerEl.append(cardEl);
}
  
function handleMoreInfoButtonClick(event, eventObj) {
    //TODO: Implement opening modal
}

function queryEventsFromTicketMaster(eventType, eventState, eventCity) {
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
                    //TODO: Query info instead of description
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
        queryEventsFromTicketMaster(eventTypeEl.value, eventStateEl.value, eventCityEl.value);
    }

}

// Call back function to clear the error msg when user click on any of the input boxes
function handleFormFieldsClick() {
    pErrorMsgEl.textContent = ""
    pErrorMsgEl.style.display = "none";
}


// <----- Event Listeners ----->
searchForm.addEventListener('submit', handleSearchFormSubmit);

document.querySelectorAll('.eventData').forEach(el => {
    el.addEventListener("click", handleFormFieldsClick);
});

console.log("hello");
// window.onload = populateUsStates;

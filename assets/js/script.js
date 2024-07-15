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
// const gApiKey = "AIzaSyAjEdX6S_xFQigVRScAJn6tIFbdu_18lzA"
const gApiKey = "AIzaSyBDQBqqVosxKqFZGE2XKhBEoZUIiWJ-OUE";
const ticketMasterApiKey = "NKLwGZ8Q2Ia64tUfDRcaU1AUZ0ChUWGW"
const gMapsBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json?";
let map;
let markers = [];
let addressToMarkers = {};
let eventIdToAddressMap = {}


// <----- HELPER METHODS----->

// <---- LOCAL STORAGE HELPER METHODS---->
function storeToLocalStorage(key, eventsArr) {
    console.log("Storing the below info to localstorage");
    console.log(eventsArr);
    localStorage.setItem(key, JSON.stringify(eventsArr));
}

// Helper method to read from local storage.
function readFromLocalStorage(key) {
    const output = JSON.parse(localStorage.getItem(key));
    if (!output) {
        output = [];
    }
    return output;
}

// <---- MAP HELPER METHODS---->
//Credit: https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers
// Helper method to plot a set of locations on the map
function plotCoordinatesOnMap(locations) {
    // Create an info window to share between markers.
    const infoWindow = new google.maps.InfoWindow();

    // Create the markers.
    if (locations) {
        console.log(locations);
        locations.forEach(([position, title], i) => {
            const marker = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: position,
                title: `${title}`,
                content: createPinElement("red")
            });



            // Add a click listener for each marker, and set up the info window.
            marker.addListener("click", () => {
                infoWindow.close();
                infoWindow.setContent(marker.title);
                infoWindow.open(marker.map, marker);
            });

            markers.push(marker);
            addressToMarkers[`${title}`] = markers.length - 1;
        });
    }
}

// helper function to toggle pin color
function createPinElement(color) {
    const pin = new google.maps.marker.PinElement({
        background: color,
    });
    return pin.element;
}

// Helper method to get co-ordinates given a list of addresses and plotting them on graph.
function getLatLngForaddressAndPlotOnMap(addresses, isCenter = false) {
    for (a of addresses) {
        let formattedAddress = a.replaceAll(' ', '+');
        const geoCodeApi = `${gMapsBaseUrl}address=${formattedAddress}&key=${gApiKey}`;
        console.log(`Invoking api: ${geoCodeApi} to get the lat, lng`);
        fetch(geoCodeApi)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                //console.log(data);
                const lat = data.results[0].geometry.location.lat;
                const lng = data.results[0].geometry.location.lng;
                //locations.push([{ lat: lat, lng: lng }, a])
                if (isCenter) {
                    console.log(`Request for center. Storing co-ordinates (${lat}, ${lng}) to local storage and initing the map with them`);
                    storeToLocalStorage("center", [[{ lat: lat, lng: lng }, a]]);
                    initMap();
                    return;
                }
                // console.log(`Plotting (${lat}, ${lng}) on map`);
                // console.log("Plotting " + data.results[0].formatted_address);
                plotCoordinatesOnMap([[{ lat: lat, lng: lng }, data.results[0].formatted_address]]);
            });
    }
    // console.log("markers");
    // console.log(markers);
    // console.log("map");
    // console.log(addressToMarkers);
    // console.log("eventid to address map");
    // console.log(eventIdToAddressMap);
}

// Credit: https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers
// Initialize the map with a "center" location stored in local storage.
function initMap() {
    const locationData = readFromLocalStorage("center");
    console.log("initing map with below data");
    console.log(locationData);
    if (locationData) {
        const curLocation = locationData[0];
        console.log("curloca");
        console.log(curLocation);
        map = new google.maps.Map(document.getElementById("googleMapsContainer"), {
            zoom: 12,
            center: {
                lat: curLocation[0].lat, lng: curLocation[0].lng
            },
            mapId: "2949a34a4a7c2b1a" //"eventsMap"
        });
        plotCoordinatesOnMap(locationData);
    }
}

// <----- HELPER METHOD FOR RENDERING RESULTS---->
const resultsContainerEl = document.getElementById('eventResultsContainer');

// Read from local storage, loop through the events and render the events card.
function renderResults() {
    // Get events from localStorage
    const events = readFromLocalStorage("events");
    resultsContainerEl.innerHTML = '';
    const addresses = []

    // Loop through events and render a card for each event
    console.log("events");
    console.log(events);
    if (events.length !== 0) {
        let idx = 0;
        for (const event of events) {
            renderCard(event, idx);
            // record address
            addresses.push(event.address);
            eventIdToAddressMap[`${idx}`] = event.address;
            idx++;
        }
    } else {
        // display a notification saying no results from ticket master
        const divEl = document.createElement("div");
        divEl.setAttribute("class", "notification is-warning is-light")

        const delBtnEl = document.createElement("button");
        delBtnEl.setAttribute("class", "delete");
        const pMsgEl = document.createElement("p");
        const eType = eventTypeEl.value.toLowerCase() === "events" ? "" : eventTypeEl.value
        pMsgEl.textContent = `No ${eType} events found on TicketMaster for ${eventCityEl.value},  ${eventStateEl.value}.`;
        divEl.append(delBtnEl, pMsgEl);
        resultsContainerEl.append(divEl);
        console.log("wiat");
    }

    // Create Google button
    const googleBtn = document.createElement('button');
    googleBtn.setAttribute('class', 'button mb-5 is-info is-light is-hovered has-text-weight-normal');
    googleBtn.style.width = '100%';
    document.getElementById("googleEvents").innerHTML = "";

    // Add Google Icon
    googleBtn.textContent = `Google search events results in ${eventCityEl.value},  ${eventStateEl.value}.`;
    const googleIcon = document.createElement('img');
    googleIcon.src = './assets/images/google.png';
    googleIcon.style.width = '24px';
    googleIcon.style.height = '24px';
    googleIcon.classList.add('mr-4');
    googleBtn.prepend(googleIcon);
    // resultsContainerEl.append(googleBtn);
    document.getElementById("googleEvents").append(googleBtn);

    // Add event listener to Google button
    googleBtn.addEventListener('click', handleGoogleButtonClick);

    console.log("Getting lat/lng for event addresses and plot on map ");
    console.log(addresses)
    getLatLngForaddressAndPlotOnMap(addresses);

    // Add mouseover event listener for the result cards
    const resultCardEls = document.querySelectorAll("[data-eventId]");
    resultCardEls.forEach(function (elem) {
        //elem.addEventListener("click", (event) => handleCardClick(event));
        elem.addEventListener("mouseenter", (event) => handleCardMouseEvent(event, "enter"));
        elem.addEventListener("mouseleave", (event) => handleCardMouseEvent(event, "exit"));
    });
}

// Helper method to handle mouse over event on the result card to change the pin color
function handleCardMouseEvent(event, eventName) {
    console.log("card click");
    console.log(eventName);
    console.log(event);
    // get the src element of the event from the event obj
    const srcEl = event.srcElement;

    // get the closes parent with the class eventResultCard
    const parentEl = srcEl.closest(".eventResultCard");
    console.log(parentEl);

    // access the data attribute eventId from the parent element.
    const eventId = parentEl.dataset.eventid;
    console.log(`Clicked on event with id: ${eventId}`);

    // get address from event id
    const address = eventIdToAddressMap[eventId];
    console.log(`got back address as ${address}`);
    const searchStr = address.split(" ")[0];

    let markerId;
    for (const [key, value] of Object.entries(addressToMarkers)) {
        console.log(value);
        if (key.includes(searchStr)) {
            markerId = value;
            break;
        }
    }

    console.log(`Got back markerId as: ${markerId}`);

    if (markers[markerId]) {
        let pincolor;
        if (eventName === "enter") {
            pincolor = "blue"
        } else {
            pincolor = "red"
        }
        const pinElement = createPinElement(pincolor);
        markers[markerId].element.innerHTML = '';
        markers[markerId].element.appendChild(pinElement);
    }
}

// Helper method to create results with styling card
function renderCard(eventObj, eventId) {

    const cardBoxEl = document.createElement("div");
    cardBoxEl.setAttribute("class", "box eventResultCard");
    cardBoxEl.setAttribute("data-eventid", eventId);
    const articleEl = document.createElement("article");
    articleEl.setAttribute("class", "media");

    // Thumbnail
    const mediaImgEl = document.createElement('div');
    mediaImgEl.setAttribute('class', 'media-left'); //mr-5 
    mediaImgEl.style.backgroundImage = `url(${eventObj.thumbnail})`;
    mediaImgEl.style.backgroundSize = 'cover';
    mediaImgEl.style.backgroundPosition = 'center';
    mediaImgEl.style.height = '150px';
    mediaImgEl.style.width = '150px';
    // append thumbnail to article
    articleEl.appendChild(mediaImgEl);

    // Results card
    const mediaContentEl = document.createElement('div');
    mediaContentEl.setAttribute("class", "media-content");
    const contentCardEL = document.createElement('div');
    contentCardEL.setAttribute("class", "content")

    // Title
    const titleEl = document.createElement('h3');
    titleEl.textContent = eventObj.title;

    // Info
    const infoEl = document.createElement('div');
    const dateEl = document.createElement('p');
    dateEl.innerHTML = `<b>Date & Time:</b> ${(new Date(eventObj.dateTime))
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
    contentCardEL.append(titleEl, infoEl);

    //Nav bar
    const navEl = document.createElement('nav');
    navEl.setAttribute("class", "level");
    navEl.style.alignItems = "flex-start";
    const miscDivEl = document.createElement('div');
    miscDivEl.setAttribute("class", "level-left");
    miscDivEl.style.flexDirection = "row";

    // ticketmaster icon
    const aSrcEl = document.createElement("a");
    aSrcEl.setAttribute('class', "level-item");
    const spanSrcEl = document.createElement("span");
    spanSrcEl.setAttribute("class", "icon is-small");
    const sourceEl = document.createElement('img');
    sourceEl.src = './assets/images/ticketmaster-logo.png';
    spanSrcEl.appendChild(sourceEl);
    aSrcEl.append(spanSrcEl);

    // More info
    const aMoreInfoEl = document.createElement("a");
    aMoreInfoEl.setAttribute('class', "level-item");
    const spanMoreInfoEl = document.createElement("span");
    spanMoreInfoEl.textContent = 'More Info';
    spanMoreInfoEl.addEventListener('click', (event) => handleMoreInfoButtonClick(event, eventObj));
    aMoreInfoEl.append(spanMoreInfoEl);
    miscDivEl.append(aSrcEl);
    miscDivEl.append(aMoreInfoEl);
    navEl.append(miscDivEl);

    mediaContentEl.append(contentCardEL)
    mediaContentEl.append(navEl);
    articleEl.append(mediaContentEl);
    cardBoxEl.appendChild(articleEl);
    resultsContainerEl.append(cardBoxEl);
}

// Helper method to create results card
function _renderCard(eventObj) {
    // Results card
    const cardEl = document.createElement('div');
    // cardEl.setAttribute('class', 'p-5 mb-5 ');
    cardEl.style.borderRadius = '10px';
    // cardEl.style.border = '2px solid black';
    cardEl.style.position = 'relative';
    cardEl.style.width = "60%";

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
    dateEl.innerHTML = `<b>Date & Time:</b> ${(new Date(eventObj.dateTime))
        .toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        })}`;
    const addressEl = document.createElement('p');
    // addressEl.textContent = 'Address: ' + eventObj.address;
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

// <---- GOOGLE EVENTS BUTTONG---->

function handleGoogleButtonClick(event) {

    const eventCity = eventCityEl.value;
    const eventType = eventTypeEl.value;
    const eventState = eventStateEl.value;
    const query = `${eventType} events in ${eventCity}, ${eventState}`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&ibp=htl;events`;
    window.open(googleSearchUrl, '_blank');
}

// <----- HELPER METHOD FOR FORM SUBMIT----->

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
                        eventInfo.address = d._embedded.venues[0].address.line1 === undefined ? "" : d._embedded.venues[0].address.line1 + `, ${eventCity}, ${eventState}`;
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
                storeToLocalStorage("events", eventsData);
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

function populateUsStates() {
    const eventStateEl = document.getElementById("eventState");
    for (s of usStates) {
        const optionEl = document.createElement("option");
        optionEl.textContent = s;
        optionEl.value = s;
        eventStateEl.appendChild(optionEl);
    }
}

// <----- EVENT CALLBACKS ---->

// Event call back to  handle more-info button click.
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
    if (eventObj.link) {
        const linkEl = document.createElement('p');
        linkEl.id = 'modalLink';
        linkEl.innerHTML = `<a href="${eventObj.link}" target="_blank">Event Link</a>`;
        modalContentEl.appendChild(linkEl);
    }

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

// Call back function for the search button
function handleSearchFormSubmit(event) {
    event.preventDefault();

    // clear local storage of old search results
    storeToLocalStorage("events", []);

    // reset globals
    markers = [];
    addressToMarkers = {};
    eventIdToAddressMap = {};

    if (validateFieldsAreNotEmpty()) {
        // Get the lat and lng for the search city and state and store it in local storage as the new center
        getLatLngForaddressAndPlotOnMap([eventCityEl.value + "," + eventStateEl.value], true);
        // init map with the new center
        initMap();

        // Query ticket master and render the results and event location on the map
        queryAndRenderEventsFromTicketMaster(eventTypeEl.value, eventCityEl.value, eventStateEl.value);
    }
}

// Call back function to clear the error msg when user click on any of the input boxes
function handleFormFieldsClick() {
    pErrorMsgEl.textContent = ""
    pErrorMsgEl.style.display = "none";
}

// Call back method to handle load window event
function initWindowFunction() {
    // empty localstorage
    storeToLocalStorage("events", []);
    // populate the drop down button with the US states
    populateUsStates();

    // Get current location - lat/lng
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log(`Current location points to: lat:${lat} and lng: ${lng}`);
            const gReverseGeoCodingApi = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&sensor=true&key=${gApiKey}`;
            // console.log(`Invoking reverse geocoding api: ${gReverseGeoCodingApi} to fetch the city and state from the co-ordinates`);
            fetch(gReverseGeoCodingApi)
                .then(function (response) {
                    // console.log("response");
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
                    console.log("Storing cur location to local storage for plotting.");
                    const locationData = [{ lat: lat, lng: lng }, curCity + ", " + curState];
                    storeToLocalStorage("center", [locationData]);
                    initMap();
                    queryAndRenderEventsFromTicketMaster("events", curCity, curState);
                });

        });
    } else {
        console.log("not enabled");
    }
    // TODO: What msg to print if user does not enable  gelocatuon
}


// <----- Add Event Listeners ----->
searchForm.addEventListener('submit', handleSearchFormSubmit);

document.querySelectorAll('.formControls').forEach(el => {
    el.addEventListener("click", handleFormFieldsClick);
});

window.onload = initWindowFunction;

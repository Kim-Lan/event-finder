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

            //TODO: Call render method 
            //todoRenderMethod(eventsData);
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

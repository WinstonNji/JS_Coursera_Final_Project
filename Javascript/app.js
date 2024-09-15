
const Geoapify_API_Key = "f016b4108e1a44049330464c23eb8625";
const amadeus_API_Key = "AdNwBdRyzYk9VDGbVsqvGLD2bLTltlpq";  // Client ID
const amadeus_API_Secret = "0QMGNh59wTyHQO9N";  // Client Secret
const compatibleActivities = []
let selectedActivities = []
const form = document.querySelector("form");


    document.querySelector('.clear-btn').addEventListener('click',() => {
        document.getElementById('tz').innerHTML = 'TimeZone and Recommendation Will Appear Here';
        document.getElementById("displayArea").textContent = '';
        document.getElementById("userInput").innerHTML='';
    
    })
    
    form.addEventListener('submit', event => {
        event.preventDefault();
        const userLocation = document.getElementById("userInput").value.trim();
    
        if(userLocation === ""){
            document.getElementById("displayArea").innerHTML = `PLEASE ENTER A CITY OR DESTINATION`
        }
    
        fetchGeoCoordinates(userLocation);
    
        document.getElementById("userInput").style.fontWeight = 700;
    
        document.querySelector('#tz').innerHTML = `Loading...`
    });
    
    
    
    function generateRandomNumber(arrayLength){
        const randomNumber = Math.floor(Math.random()*arrayLength)
        return randomNumber
    }
    
    // Fetch geocoordinates for the user's location
    function fetchGeoCoordinates(userLocation) {
        fetch(`https://api.geoapify.com/v1/geocode/search?text=${userLocation}&format=json&apiKey=${Geoapify_API_Key}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Couldn't Find This Location");
                } else {
                    return response.json();
                }
            })
            .then(data => {
                const city = `${data.results[0].city}, ${data.results[0].country}`;
    
                const latitude = Number(data.results[0].lat);
                const longitude = Number(data.results[0].lon);          

                fetchActivities(latitude, longitude);
                displayTime(latitude,longitude)
    
            })
            .catch(error => {
                document.querySelector('#tz').innerHTML = error
                console.error("Error fetching geocoordinates:", error);
            });
    }
    
    // Get Amadeus access token
    function getAmadeusAccessToken() {
        return fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': amadeus_API_Key,
                'client_secret': amadeus_API_Secret
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to obtain access token');
            }
            return response.json();
        })
        .then(data => {
            return data.access_token;
        })
        .catch(error => {
            console.error('Error fetching access token:', error);
        });
    }
    // Fetch activities using latitude and longitude
    function fetchActivities(lat, lon) {
        getAmadeusAccessToken().then(token => {
            if (!token) {
                console.error('No access token available');
                return;
            }
    
            fetch(`https://test.api.amadeus.com/v1/shopping/activities?latitude=${lat}&longitude=${lon}&radius=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not find activities for this location");
                } else {
                    return response.json();
                }
            })
            .then(activities => {
                // Clears previouse compatible activities before refilling the array
                compatibleActivities.length = 0;

                // Filters the activities
                activities.data.forEach(activity => {
                    
                    if(activity.shortDescription && activity.shortDescription !== `Unspecified` && activity.pictures.length > 0){
                        compatibleActivities.push(activity)
                    }
                })

                selectedActivities.length = 0; // Clear previous selections

                // Randomly selects 7 activities out of all filtered activities
                for(let i = 0; i < 6; i++){
                    const dataLength = generateRandomNumber(compatibleActivities.length)
    
                    let selectedActivity = compatibleActivities[dataLength]
    
                    selectedActivities.push(selectedActivity)
                }   
    
                displayActivities(selectedActivities)
            })
            .catch(error => {
                document.querySelector('#tz').innerHTML = error
                console.error("Error Couldn't find activities:", error);
            });
        });
    }

    function displayActivities(selectedActivities){    
        let display = '';
    
        selectedActivities.forEach(selectedActivity => {
            display += `
                            
                            <div class="container">
                                <img src="${selectedActivity.pictures}" alt="Image of ${selectedActivity.name}">
                                <div class="containerText">
                                    <h2>${selectedActivity.name}</h2>
                                    <p>${selectedActivity.shortDescription}</p>
                                    <button>Visit</button>
                                </div>
                            </div>
            `
    
            document.getElementById("displayArea").innerHTML = display
        })
    }
    // Updates the time
    function displayTime(lat,lon){
         let meridiem = ''
            fetch(`https://timeapi.io/api/time/current/coordinate?latitude=${lat}&longitude=${lon}`).then(
                response => {
                    if(!response.ok){
                        throw new Error("Couldn't get time for this location")
                    }else{
                        return response.json()
                    }
                }
            ).then(data =>{
                if(data.hour>12){
                    meridiem = `AM`
                }else{
                    meridiem = `PM`
                }
        
                setTimeout(()=> {
                    document.querySelector('#tz').innerHTML = `Current Local Time(${data.timeZone}): ${data.time} ${meridiem}`
                },3000)
            })
    }

document.querySelector('#aboutUsNav').addEventListener('click',()=> {
    document.getElementById('aboutUs').style.paddingTop = '100px'
})
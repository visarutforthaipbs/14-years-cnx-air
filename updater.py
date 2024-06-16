import requests
import json
from datetime import datetime

# API endpoint URL
url = "http://air4thai.com/forweb/getAQI_JSON.php"

# Perform a GET request to the API
response = requests.get(url)
response.raise_for_status()  # Raise an error if the request fails

# Parse the JSON data
data = response.json()

# Extract the list of stations
stations_data = data.get('stations', [])

# Filter data for the station with ID '36t'
station_id_to_focus = "36t"
filtered_station_data = next((station for station in stations_data if station.get('stationID') == station_id_to_focus), None)

if filtered_station_data:
    # Extract current AQI data for PM2.5
    current_data = filtered_station_data.get('AQILast', {})

    # Get the current PM2.5 value
    pm25_value = current_data.get('PM25', {}).get('value', 'N/A')
    date = current_data.get('date', 'N/A')
    time = current_data.get('time', 'N/A')

    # Prepare data to save
    data_to_save = {
        "date": date,
        "time": time,
        "pm25": pm25_value
    }

    # Display the data for verification
    print(data_to_save)

    # Load existing data from JSON file if it exists
    try:
        with open('pm25_data.json', 'r', encoding='utf-8') as json_file:
            existing_data = json.load(json_file)
    except FileNotFoundError:
        existing_data = []

    # Append new data to existing data
    existing_data.append(data_to_save)

    # Save updated data to JSON file
    with open('pm25_data.json', 'w', encoding='utf-8') as json_file:
        json.dump(existing_data, json_file, ensure_ascii=False, indent=4)
    print("Data saved to pm25_data.json")

else:
    print(f"No data found for station ID '{station_id_to_focus}'.")

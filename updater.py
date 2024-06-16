import requests
import json
from datetime import datetime
import os

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
    date_str = current_data.get('date', 'N/A')
    time = current_data.get('time', 'N/A')

    # Convert the date format to match "YYYY-MM-DD"
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        date = date_str  # Keep the original if format conversion fails

    # Prepare data for debugging and formatted output
    debug_data_to_save = {
        "date": date,
        "time": time,
        "pm25": pm25_value
    }
    
    formatted_data_to_save = {
        "date": date,
        "pm25": pm25_value if pm25_value != 'N/A' else "No Data"
    }

    # Display the data for verification
    print("Debug Data:", debug_data_to_save)
    print("Formatted Data:", formatted_data_to_save)

    # Paths to the JSON files
    pm25_data_path = 'pm25_data.json'
    pm25_formatted_path = 'pm25_formatted.json'

    # Load existing data from the debug JSON file if it exists
    try:
        with open(pm25_data_path, 'r', encoding='utf-8') as json_file:
            existing_debug_data = json.load(json_file)
        print(f"Loaded existing data from {pm25_data_path}")
    except FileNotFoundError:
        existing_debug_data = []
        print(f"File {pm25_data_path} not found, creating a new one.")
    except Exception as e:
        print(f"Error loading {pm25_data_path}: {e}")
        existing_debug_data = []

    # Append new debug data to existing data
    existing_debug_data.append(debug_data_to_save)

    # Save updated debug data to JSON file
    try:
        with open(pm25_data_path, 'w', encoding='utf-8') as json_file:
            json.dump(existing_debug_data, json_file, ensure_ascii=False, indent=4)
        print(f"Debug data saved to {pm25_data_path}")
    except Exception as e:
        print(f"Error saving to {pm25_data_path}: {e}")

    # Load existing data from the formatted JSON file if it exists
    try:
        with open(pm25_formatted_path, 'r', encoding='utf-8') as json_file:
            existing_formatted_data = json.load(json_file)
        print(f"Loaded existing data from {pm25_formatted_path}")
    except FileNotFoundError:
        existing_formatted_data = []
        print(f"File {pm25_formatted_path} not found, creating a new one.")
    except Exception as e:
        print(f"Error loading {pm25_formatted_path}: {e}")
        existing_formatted_data = []

    # Convert existing formatted data to a dictionary for easy lookup and update
    formatted_data_dict = {entry["date"]: entry["pm25"] for entry in existing_formatted_data}

    # Update or add the new formatted data
    formatted_data_dict[formatted_data_to_save["date"]] = formatted_data_to_save["pm25"]

    # Convert back to list of dictionaries sorted by date
    updated_formatted_data = [{"date": date, "pm25": pm25} for date, pm25 in sorted(formatted_data_dict.items())]

    # Save updated formatted data to JSON file
    try:
        with open(pm25_formatted_path, 'w', encoding='utf-8') as json_file:
            json.dump(updated_formatted_data, json_file, ensure_ascii=False, indent=2)
        print(f"Formatted data saved to {pm25_formatted_path}")
    except Exception as e:
        print(f"Error saving to {pm25_formatted_path}: {e}")

else:
    print(f"No data found for station ID '{station_id_to_focus}'.")

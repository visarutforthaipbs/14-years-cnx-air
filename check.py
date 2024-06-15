import json
from datetime import datetime, timedelta

# Load the data
with open('pm25_formatted.json', 'r') as file:
    data = json.load(file)

# Convert data to a dictionary for easy lookup
data_dict = {entry['date']: entry['pm25'] for entry in data}

# Check data completeness for June and July
missing_dates = []
for year in range(2011, 2025):
    for month in [6, 7]:  # June and July
        for day in range(1, 32):  # Assuming 31 days to catch all possible dates
            date_str = f"{year}-{month:02d}-{day:02d}"
            if date_str not in data_dict:
                missing_dates.append(date_str)

print("Missing Dates:", missing_dates)

import pandas as pd
import numpy as np
import json

# Load the updated dataset
file_path_updated = 'clean-month.csv'
print(f"Loading data from {file_path_updated}...")

try:
    data = pd.read_csv(file_path_updated)
    print("Data loaded successfully.")
except Exception as e:
    print(f"Error loading data: {e}")

# Display the first few rows to understand the structure
print("Sample data:")
print(data.head())

# Trim whitespace and remove blank rows in 'month' or 'date'
data['month'] = data['month'].str.strip()
data['date'] = data['date'].apply(lambda x: str(x).strip() if pd.notna(x) else x)

# Drop rows where 'month' or 'date' is NaN or empty
data = data.dropna(subset=['month', 'date'])
data = data[(data['month'] != '') & (data['date'] != '')]

# Map month names to numbers
month_map = {'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
             'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12}

data['month'] = data['month'].map(month_map)

# Ensure 'month' column has no NaNs before converting to int
data = data.dropna(subset=['month'])

# Convert 'date' to integers
data['date'] = pd.to_numeric(data['date'], errors='coerce')
data = data.dropna(subset=['date']).astype({'date': 'int'})

# Melt the data to long format
try:
    data_long = pd.melt(data, id_vars=['month', 'date'], var_name='year', value_name='pm25')
    print("Data reshaped to long format.")
except Exception as e:
    print(f"Error reshaping data: {e}")

# Check for and drop rows where 'year' is non-finite
data_long['year'] = pd.to_numeric(data_long['year'], errors='coerce')
data_long = data_long.dropna(subset=['year'])

# Ensure all date-related columns are integers
data_long['year'] = data_long['year'].astype(int)
data_long['month'] = data_long['month'].astype(int)
data_long['date'] = data_long['date'].astype(int)

# Display a sample of the data after conversion to integers
print("Data after converting to integers:")
print(data_long.head())

# Define a function to validate the date
def validate_date(row):
    try:
        # Try to create a datetime object
        pd.Timestamp(year=int(row['year']), month=int(row['month']), day=int(row['date']))
        return True
    except ValueError:
        # Return False if an error occurs
        return False

# Apply the function to filter invalid dates
valid_dates_mask = data_long.apply(validate_date, axis=1)
data_long_valid = data_long[valid_dates_mask].copy()

# Create a 'date' column combining 'year', 'month', and 'day'
try:
    data_long_valid['date'] = pd.to_datetime(data_long_valid[['year', 'month', 'date']].rename(columns={'date': 'day'}))
    print("Date column created successfully.")
except Exception as e:
    print(f"Error creating date column: {e}")

# Convert date to ISO format for JSON serialization
data_long_valid['date'] = data_long_valid['date'].dt.strftime('%Y-%m-%d')

# Replace NaNs with a specific indicator for missing data
data_long_valid['pm25'] = data_long_valid['pm25'].apply(lambda x: "No Data" if pd.isna(x) else str(x))

# Select only 'date' and 'pm25' columns
data_long_valid = data_long_valid[['date', 'pm25']]

# Convert to a list of dictionaries
data_list = data_long_valid.to_dict('records')

# Save to a JSON file for D3.js
output_file_path = '/Users/visarutsankham/Desktop/Bad-Air-CNX/pm25_formatted.json'

try:
    with open(output_file_path, 'w') as f:
        json.dump(data_list, f)
    print(f"Data saved to {output_file_path}")
except Exception as e:
    print(f"Error saving data to JSON: {e}")

# Display a sample of the formatted data
print("Formatted sample data:")
print(data_long_valid.head())

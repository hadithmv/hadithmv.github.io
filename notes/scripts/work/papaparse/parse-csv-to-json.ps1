# CSV to JSON Array Converter
# This script processes all CSV files in the current directory and converts them to JSON arrays

# Get all CSV files in the current directory
$csvFiles = Get-ChildItem -Path "." -Filter "*.csv"

# Check if any CSV files were found
if ($csvFiles.Count -eq 0) {
    Write-Host "No CSV files found in the current directory."
    exit
}

# Process each CSV file
foreach ($file in $csvFiles) {
    $csvPath = $file.FullName
    $jsonPath = [System.IO.Path]::ChangeExtension($csvPath, "json")
    
    Write-Host "Converting $($file.Name) to JSON array format..."
    
    try {
        # Read the CSV file
        $csv = Import-Csv -Path $csvPath
        
        # Get the header row (property names)
        if ($csv.Count -gt 0) {
            $headers = $csv[0].PSObject.Properties.Name
            
            # Create an array of arrays
            $jsonArray = @()
            
            # Add the header row as the first array
            $jsonArray += ,@($headers)
            
            # Add each data row as an array
            foreach ($row in $csv) {
                $rowArray = @()
                foreach ($header in $headers) {
                    $rowArray += $row.$header
                }
                $jsonArray += ,@($rowArray)
            }
            
            # Convert to JSON with nice formatting
            $jsonContent = $jsonArray | ConvertTo-Json -Depth 10
            
            # Save JSON to file
            $jsonContent | Out-File -FilePath $jsonPath -Encoding UTF8
            
            Write-Host "Successfully created $([System.IO.Path]::GetFileName($jsonPath))" -ForegroundColor Green
        }
        else {
            Write-Host "Warning: $($file.Name) appears to be empty." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "Conversion completed. Processed $($csvFiles.Count) file(s)."

<#
I'll create a PowerShell script that converts any CSV files in the current directory to JSON format.
CSV to JSON ConverterClick to open codeTap to open
This script will:

Find all CSV files in the current directory
Process each file by:

Importing the CSV data
Converting it to JSON format with proper indentation
Saving it as a new file with the same name but .json extension


Display progress messages and confirmation when complete

To use the script:

Save it as a .ps1 file (e.g., ConvertCsvToJson.ps1)
Place it in the directory containing your CSV files
Run it in PowerShell by typing .\ConvertCsvToJson.ps1

The script includes error handling and will tell you if no CSV files are found or if there are issues processing any files.

...

You're right - the default ConvertTo-Json behavior creates an array of objects with named properties, but you're looking for an array of arrays (without property names). Let me revise the script to produce the JSON format you want.
CSV to JSON Array ConverterClick to open codeTap to open
This updated script will now create JSON files with an array of arrays format:

The first array contains the CSV header names
Each subsequent array contains the corresponding row values
The result will be structured as [ ["header1", "header2"], ["value1", "value2"], ... ]

This format creates a true two-dimensional array without named properties, matching your requested format with proper nested arrays.

#>
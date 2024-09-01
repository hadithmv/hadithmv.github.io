# Set the current location to the directory containing the script
Set-Location -Path $PSScriptRoot -ErrorAction Stop

# Check if uglify-js is installed
if (-not (Get-Command uglifyjs -ErrorAction SilentlyContinue)) {
    Write-Host "uglify-js is not installed. Please install it using 'npm install uglify-js -g'"
    exit
}

# Get all JSON files in the current directory and process them
Get-ChildItem -Filter "*.json" | ForEach-Object {
    try {
        # Read the content of the JSON file
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop
        
        # Prepend "var data = " to the JSON content
        $newContent = "var data = " + $content
        
        # Create the new filename by changing the extension from .json to .js
        $newFileName = [System.IO.Path]::ChangeExtension($_.FullName, ".js")
        
        # Write the new content to a temporary JS file
        $tempFileName = [System.IO.Path]::GetTempFileName()
        $newContent | Set-Content $tempFileName -ErrorAction Stop
        
        # Run uglify-js on the temporary file and output to the final JS file
        $uglifyCommand = "uglifyjs $tempFileName -c -m -o $newFileName"
        Invoke-Expression $uglifyCommand
        
        # Remove the temporary file
        Remove-Item $tempFileName
        
        # If successful, print a success message
        Write-Host "Processed & minified: $($_.Name)"
    }
    catch {
        # If an error occurs during processing, catch it and print an error message
        Write-Host "Error processing $($_.Name): $_"
    }
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
# Set the current location to the directory containing the script
# -ErrorAction Stop ensures the script terminates if this operation fails
Set-Location -Path $PSScriptRoot -ErrorAction Stop

# Get all JSON files in the current directory and process them
Get-ChildItem -Filter "*.json" | ForEach-Object {
    try {
        # Read the content of the JSON file
        # -Raw parameter reads the entire content as a single string
        # -ErrorAction Stop ensures the script catches any errors during this operation
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop

        # Prepend "var dataSet = " to the JSON content
        $newContent = "var data = " + $content

        # Create the new filename by changing the extension from .json to .js
        $newFileName = [System.IO.Path]::ChangeExtension($_.FullName, ".js")

        # Write the new content to the JS file
        # The pipeline | is used to pass $newContent to Set-Content
        # -ErrorAction Stop ensures the script catches any errors during this operation
        $newContent | Set-Content $newFileName -ErrorAction Stop

        # If successful, print a success message
        Write-Host "Processed: $($_.Name)"
    }
    catch {
        # If an error occurs during processing, catch it and print an error message
        # $_ represents the error object
        Write-Host "Error processing $($_.Name): $_"
    }
}
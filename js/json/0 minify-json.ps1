# Set the current location to the directory containing the script
Set-Location -Path $PSScriptRoot -ErrorAction Stop

Get-ChildItem -Filter "*.json" | ForEach-Object {
    try {
        # Read the content of the JSON file
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop
        
        # Parse and convert back to JSON to minify
        $jsonObject = $content | ConvertFrom-Json
        $minifiedJson = $jsonObject | ConvertTo-Json -Compress
        # Used PowerShell's built-in JSON handling (ConvertFrom-Json and ConvertTo-Json -Compress)
        
        # Write the minified content back to the same file
        $minifiedJson | Set-Content $_.FullName -ErrorAction Stop
        
        # If successful, print a success message
        Write-Host "Minified: $($_.Name)"
    }
    catch {
        # If an error occurs during processing, catch it and print an error message
        Write-Host "Error processing $($_.Name): $_"
    }
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
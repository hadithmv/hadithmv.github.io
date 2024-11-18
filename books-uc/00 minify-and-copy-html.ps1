# Set the current working directory to the directory containing the script
Set-Location -Path $PSScriptRoot

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile) {
    # Read the content of the file
    $content = Get-Content -Path $inputFile -Raw
    
    # Replace .css with .min.css in link tags, being careful not to replace .min.css again
    $content = $content -replace '(href="[^"]*?)(?<!\.min)\.css"', '$1.min.css"'
    
    # Replace .js with .min.js in script tags, being careful not to replace .min.js again
    $content = $content -replace '(src="[^"]*?)(?<!\.min)\.js"', '$1.min.js"'
    
    # Create a temporary file for the modified content
    $tempFile = [System.IO.Path]::GetTempFileName()
    $content | Set-Content -Path $tempFile -NoNewline
    
    # Use html-minifier with the temporary file
    html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $tempFile -o $outputFile
    
    # Clean up the temporary file
    Remove-Item $tempFile
}

# Get all HTML files in the current directory
$files = Get-ChildItem -Filter "*.html"

# Loop through each HTML file
foreach ($file in $files) {
    # Check if the file name contains "test", "backup", or "copy"
    if ($file.Name -notmatch "(test|backup|copy)") {
        # Get the file name without extension
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        
        # Construct the input file path
        $inputFile = $file.FullName
        
        # Construct the output file path, placing the file in the ../folder/ directory
        # CHANGE THIS 123!!!
        $outputFile = "../books/$($file.Name)"
        
        # Call the MinifyHTML function to process the file
        MinifyHTML $inputFile $outputFile
        
        # Print a message indicating that the file has been processed
        Write-Output "Processed: $($file.Name)"
    }
}

# SEPARATE

# copies index page over to layout index dir
Copy-Item "../books/index.html" -Destination "../_layouts/index.html"

# copies 404 to root
#Copy-Item "../page/404.html" -Destination "../404.html"

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
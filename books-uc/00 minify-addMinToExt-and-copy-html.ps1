# Set the current working directory to the directory containing the script
Set-Location -Path $PSScriptRoot

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if html-minifier is installed
        if (-not (Get-Command html-minifier -ErrorAction SilentlyContinue)) {
            throw "html-minifier is not installed. Please install it using 'npm install -g html-minifier'"
        }

        # Read the content of the file
        $content = Get-Content -Path $inputFile -Raw -ErrorAction Stop
        
        # Replace .css with .min.css in link tags, being careful not to replace .min.css again
        $content = $content -replace '(href="[^"]*?)(?<!\.min)\.css"', '$1.min.css"'
        
        # Replace .js with .min.js in script tags, being careful not to replace .min.js again
        $content = $content -replace '(src="[^"]*?)(?<!\.min)\.js"', '$1.min.js"'
        
        # Create a temporary file for the modified content
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline -ErrorAction Stop
        
        # Ensure output directory exists
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        # Use html-minifier with the temporary file
        $minifierResult = html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $tempFile -o $outputFile 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "html-minifier failed: $minifierResult"
        }
    }
    catch {
        Write-Error "Error processing file $inputFile : $_"
        return $false
    }
    finally {
        # Clean up the temporary file if it exists
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
    return $true
}

# Get all HTML files in the current directory
try {
    $files = Get-ChildItem -Filter "*.html" -ErrorAction Stop

    # Loop through each HTML file
    foreach ($file in $files) {
        # Check if the file name contains "test", "backup", or "copy"
        if ($file.Name -notmatch "(test|backup|copy)") {
            # Get the file name without extension
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            
            # Construct the input and output file paths
            $inputFile = $file.FullName
            $outputFile = "../books/$($file.Name)"
            
            # Call the MinifyHTML function to process the file
            $success = MinifyHTML $inputFile $outputFile
            
            # Print appropriate message based on success
            if ($success) {
                Write-Output "✅ Processed: $($file.Name)"
            } else {
                Write-Output "❌ Failed to process: $($file.Name)"
            }
        }
    }

    # Copy index page over to layout index dir
    try {
        if (Test-Path "../books/index.html") {
            Copy-Item "../books/index.html" -Destination "../_layouts/index.html" -ErrorAction Stop
            Write-Output "✅ Copied index.html to _layouts"
        } else {
            Write-Warning "index.html not found in ../books/"
        }
    }
    catch {
        Write-Error "Failed to copy index.html: $_"
    }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}

Write-Output "`n✅ -- ✅ -- DONE -- ✅ -- ✅"
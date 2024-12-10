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
        # Clean up temp file if it exists
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
    return $true
}

# Function to minify JS using Google Closure Compiler and Terser
function MinifyJS($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if required tools are installed
        if (-not (Get-Command google-closure-compiler -ErrorAction SilentlyContinue)) {
            throw "google-closure-compiler is not installed. Please install it using 'npm install -g google-closure-compiler'"
        }
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) {
            throw "terser is not installed. Please install it using 'npm install -g terser'"
        }

        $tempFile = [System.IO.Path]::GetTempFileName()
        $closureOutput = [System.IO.Path]::GetTempFileName()

        # Run Google Closure Compiler
        $closureResult = google-closure-compiler --charset=UTF-8 --js $inputFile --js_output_file $closureOutput 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Closure Compiler failed: $closureResult"
        }

        # Run Terser on the output from Closure Compiler
        $terserResult = terser $closureOutput -c -m --comments=false -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Terser failed: $terserResult"
        }
    }
    catch {
        Write-Error "Error minifying JS file $inputFile : $_"
        return $false
    }
    finally {
        # Clean up temp files if they exist
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
        if ($closureOutput -and (Test-Path $closureOutput)) {
            Remove-Item $closureOutput -ErrorAction SilentlyContinue
        }
    }
    return $true
}

# Function to minify CSS using csso
function MinifyCSS($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if csso is installed
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) {
            throw "csso is not installed. Please install it using 'npm install -g csso-cli'"
        }

        $result = csso $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "CSSO failed: $result"
        }
    }
    catch {
        Write-Error "Error minifying CSS file $inputFile : $_"
        return $false
    }
    return $true
}

#

try {

    #


    # Process diffCompare files
    $diffCompareHtmlInput = "diffCompare/cdn-custom.html"
    $diffCompareHtmlOutput = "../page/diffCompare.html"
    $diffCompareJsInput = "diffCompare/mergely.js"
    $diffCompareJsOutput = "../page/diffCompare.min.js"

    # Process diffCompare HTML
    if (Test-Path $diffCompareHtmlInput) {
        # Read and modify the content
        $content = Get-Content -Path $diffCompareHtmlInput -Raw
        # $content = $content -replace 'href="../../', 'href="../'
        $content = $content -replace '../../', '../'

        $content = $content -replace '<script src="mergely.js"></script>', '<script src="diffCompare.min.js"></script>'
        
        # Create a temporary file for the modified content
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline
        
        # Minify and save the HTML
        $success = MinifyHTML $tempFile $diffCompareHtmlOutput
        if ($success) {
            Write-Output "✅ Processed diffCompare HTML"
        }
        else {
            Write-Output "❌ Failed to process diffCompare HTML"
        }
        
        # Clean up temp file
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
    else {
        Write-Warning "Warning: $diffCompareHtmlInput not found"
    }

    # Process diffCompare JS
    if (Test-Path $diffCompareJsInput) {
        $success = MinifyJS $diffCompareJsInput $diffCompareJsOutput
        if ($success) {
            Write-Output "✅ Processed diffCompare JS"
        }
        else {
            Write-Output "❌ Failed to process diffCompare JS"
        }
    }
    else {
        Write-Warning "Warning: $diffCompareJsInput not found"
    }


    #

    # Get all HTML files in the current directory
    $files = Get-ChildItem -Filter "*.html" -ErrorAction Stop

    # Process HTML files
    foreach ($file in $files) {
        $inputFile = $file.FullName
        $outputFile = "../page/$($file.Name)"
        $success = MinifyHTML $inputFile $outputFile
        
        if ($success) {
            Write-Output "✅ Processed HTML: $($file.Name)"
        }
        else {
            Write-Output "❌ Failed to process HTML: $($file.Name)"
        }
    }

    # Process JS files
    $jsFiles = @(
        "textEditor.js",
        @{
            Input  = "unitConverter/UnitOf.js"
            Output = "../page/unitConverter.min.js"
        }
    )
    foreach ($jsFile in $jsFiles) {
        if ($jsFile -is [string]) {
            $inputFile = $jsFile
            $outputFile = "../page/$([System.IO.Path]::GetFileNameWithoutExtension($jsFile)).min.js"
        }
        else {
            $inputFile = $jsFile.Input
            $outputFile = $jsFile.Output
        }

        if (Test-Path $inputFile) {
            $success = MinifyJS $inputFile $outputFile
            if ($success) {
                Write-Output "✅ Processed JS: $inputFile -> $([System.IO.Path]::GetFileName($outputFile))"
            }
            else {
                Write-Output "❌ Failed to process JS: $jsFile"
            }
        }
        else {
            Write-Warning "Warning: $inputFile not found"
        }
    }

    # # Process CSS file
    # $cssInputFile = "mergely.css"
    # $cssOutputFile = "../page/mergely.min.css"

    # if (Test-Path $cssInputFile) {
    #     $success = MinifyCSS $cssInputFile $cssOutputFile
    #     if ($success) {
    #         Write-Output "✅ Processed CSS: $cssInputFile -> $([System.IO.Path]::GetFileName($cssOutputFile))"
    #     } else {
    #         Write-Output "❌ Failed to process CSS: $cssInputFile"
    #     }
    # } else {
    #     Write-Warning "Warning: $cssInputFile not found"
    # }

    # Copy 404 to root
    try {
        if (Test-Path "../page/404.html") {
            Copy-Item "../page/404.html" -Destination "../404.html" -ErrorAction Stop
            Write-Output "✅ Copied 404.html to root"
        }
        else {
            Write-Warning "404.html not found in ../page/"
        }
    }
    catch {
        Write-Error "Failed to copy 404.html: $_"
    }

    # Process custom HTML files with path modifications
    $customFileMap = @{
        "qrCode/qrcodegen-input-custom.html" = "../page/qrGenerator.html"
        "keyboardPage/index-custom.html"     = "../page/keyboardPage.html"
        "unitConverter/index.html"           = "../page/unitConverter.html"
    }

    foreach ($mapping in $customFileMap.GetEnumerator()) {
        $inputFile = $mapping.Key
        $outputFile = $mapping.Value

        if (Test-Path $inputFile) {
            # Read and modify the content
            $content = Get-Content -Path $inputFile -Raw
            $content = $content -replace '(src=["''])../../', '$1../'
            $content = $content -replace '(href=["''])../../', '$1../'
            
            # Add specific replacement for unitConverter
            if ($inputFile -eq "unitConverter/index.html") {
                $content = $content -replace 'src="UnitOf.js"', 'src="unitConverter.min.js"'
            }

            # Create a temporary file for the modified content
            $tempFile = [System.IO.Path]::GetTempFileName()
            $content | Set-Content -Path $tempFile -NoNewline

            # Minify and save the HTML
            $success = MinifyHTML $tempFile $outputFile
            if ($success) {
                Write-Output "✅ Processed custom HTML: $inputFile -> $([System.IO.Path]::GetFileName($outputFile))"
            }
            else {
                Write-Output "❌ Failed to process custom HTML: $inputFile"
            }

            # Clean up temp file
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
            }
        }
        else {
            Write-Warning "Warning: $inputFile not found"
        }
    }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}

Write-Output "`n✅ -- ✅ -- DONE -- ✅ -- ✅"
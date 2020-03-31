# Outputs a file list in a format suitable for for including in the _init script

$files = Get-ChildItem -Path . -Filter "*.js"
Write-Host 'Number of files in filter:' @($files).Count "`r`n"
for ($i = 0; $i -lt @($files).Count; $i++) {
    $file = $files[$i].Name
    if ($file -like '_init*') { continue; }
    if ($file -like '_test*') { continue; }
    Write-Host ('"{0}"' -f $file.Replace(".js", "")) -NoNewline
    if ($i -lt ($files.Count-1)) { Write-Host "," } # Add comma for all but the last element
}

Read-Host -Prompt "`r`n`r`nPress ENTER to exit.."
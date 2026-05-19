$ftpHost = "ftpupload.net"
$ftpUser = "if0_41831134"
$ftpPass = "Sheikh0100"
$remoteDir = "/htdocs"

function Upload-File {
    param($localPath, $remotePath)
    try {
        $uri = New-Object System.Uri("ftp://$ftpHost$remotePath")
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        
        $fileBytes = [System.IO.File]::ReadAllBytes($localPath)
        $request.ContentLength = $fileBytes.Length
        
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileBytes, 0, $fileBytes.Length)
        $requestStream.Close()
        $requestStream.Dispose()
        
        $response = $request.GetResponse()
        $response.Close()
        $response.Dispose()
        Write-Host "Uploaded: $localPath to $remotePath"
    } catch {
        Write-Host "Failed to upload ${localPath}: $($_.Exception.Message)"
    }
}

function Create-Directory {
    param($remotePath)
    try {
        $uri = New-Object System.Uri("ftp://$ftpHost$remotePath")
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "Created Directory: $remotePath"
    } catch {
        # Ignore if directory already exists
        Write-Host "Directory might already exist or error: $remotePath"
    }
}

Set-Location $PSScriptRoot
Write-Host "Starting Deployment in: $PSScriptRoot"

# 1. Upload root files
$filesToUpload = Get-ChildItem -Path $PSScriptRoot | Where-Object { !$_.PSIsContainer -and $_.Name -notmatch "deploy.*\.ps1" }
Write-Host "Found $($filesToUpload.Count) root files."
foreach ($file in $filesToUpload) {
    Write-Host "Processing: $($file.Name)"
    Upload-File -localPath $file.FullName -remotePath "$remoteDir/$($file.Name)"
}

# 2. Upload assets
Create-Directory -remotePath "$remoteDir/assets"
$assets = Get-ChildItem -Path ./assets -File
foreach ($asset in $assets) {
    Upload-File -localPath $asset.FullName -remotePath "$remoteDir/assets/$($asset.Name)"
}

Write-Host "Deployment Complete!"

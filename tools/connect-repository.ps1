# Run once in your own PowerShell if this folder has source files but no Git history.
# The managed editing environment cannot write this workspace's .git directory.
# This script never writes, deletes, or checks out working-tree source files.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$repositoryPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$repositoryUrl = 'https://github.com/sytelus/jiggiscreation.git'

function Invoke-RepositoryGit {
    param([string[]] $GitArguments)
    $result = & git -C $repositoryPath @GitArguments
    if ($LASTEXITCODE -ne 0) { throw "git $($GitArguments -join ' ') failed." }
    return $result
}

$actualRoot = Invoke-RepositoryGit @('rev-parse', '--show-toplevel')
if ([System.IO.Path]::GetFullPath($actualRoot) -ne $repositoryPath) {
    throw 'The script must be inside the Jiggis Creation repository root.'
}
$branch = Invoke-RepositoryGit @('symbolic-ref', '--short', 'HEAD')
if ($branch -ne 'main') { throw 'Expected an empty main branch. No history was changed.' }
$refs = @(Invoke-RepositoryGit @('for-each-ref', '--format=%(refname)', 'refs/heads'))
if ($refs.Count -gt 0) { throw 'Local branches already contain history. Use normal Git commands instead.' }
$indexEntries = @(Invoke-RepositoryGit @('ls-files'))
if ($indexEntries.Count -gt 0) { throw 'The index already contains files. No staged work was changed.' }

$remotes = @(Invoke-RepositoryGit @('remote'))
if ($remotes -contains 'origin') {
    $existingUrl = Invoke-RepositoryGit @('remote', 'get-url', 'origin')
    if ($existingUrl -ne $repositoryUrl) { throw "Unexpected origin: $existingUrl" }
} else {
    Invoke-RepositoryGit @('remote', 'add', 'origin', $repositoryUrl)
}
Invoke-RepositoryGit @('fetch', 'origin', 'main')
$remoteCommit = Invoke-RepositoryGit @('rev-parse', 'origin/main')

# Abort if any published file is missing or has local edits. Hashing does not stage files.
$publishedPaths = @(Invoke-RepositoryGit @('ls-tree', '-r', '--name-only', $remoteCommit))
foreach ($relativePath in $publishedPaths) {
    $localPath = Join-Path $repositoryPath $relativePath
    if (-not (Test-Path -LiteralPath $localPath -PathType Leaf)) {
        throw "Published file is missing locally: $relativePath. Source files were not changed."
    }
    $localHash = Invoke-RepositoryGit @('hash-object', '--no-filters', '--', $localPath)
    $remoteHash = Invoke-RepositoryGit @('rev-parse', "${remoteCommit}:$relativePath")
    if ($localHash -ne $remoteHash) {
        throw "Local changes detected in $relativePath. Source files were not changed."
    }
}

# --mixed updates only HEAD and the index; all working-tree files stay intact.
Invoke-RepositoryGit @('reset', '--mixed', $remoteCommit)
Invoke-RepositoryGit @('branch', '--set-upstream-to=origin/main', 'main')
Invoke-RepositoryGit @('status', '--short', '--branch')
Write-Host 'Local Git history now matches GitHub. Source files were preserved.'

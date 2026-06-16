$adapter = Get-NetAdapter -Name "WiFi 2"
$idx = $adapter.InterfaceIndex
Write-Output "Setting DNS on WiFi 2 (InterfaceIndex: $idx)..."
Set-DnsClientServerAddress -InterfaceIndex $idx -ServerAddresses ("1.1.1.1","1.0.0.1")
Write-Output "Done. Verifying..."
Get-DnsClientServerAddress -InterfaceIndex $idx -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses

Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object {
    Write-Output "Adapter: $($_.Name) - $($_.InterfaceDescription)"
    $dns = Get-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
    if ($dns) {
        Write-Output "  DNS: $($dns.ServerAddresses -join ', ')"
    }
    $ip = Get-NetIPAddress -InterfaceIndex $_.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
    if ($ip) {
        Write-Output "  IP: $($ip.IPAddress)"
    }
}

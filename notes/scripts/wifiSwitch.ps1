# https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-if?view=powershell-7.3

$wifiNameIs = (get-netconnectionProfile).Name
if ($wifiNameIs -eq "iu.lan") {
    # Write-Output "The condition was true"
    C:\Users\hadit\Desktop\Hu.lnk
 } else {
    # Write-Output "The condition was false"
    netsh wlan connect name="IU"
    # C:\Users\hadit\Desktop\IU.lnk
 }

<#
# get the ssid of the currently connected wifi

(get-netconnectionProfile).Name

# If you want to simply disconnect WiFi, this command can be used:

netsh wlan disconnect

# To connect to a specific WiFi connection, you can enter this command:

netsh wlan connect name="IU"

netsh wlan show profiles
netsh interface show interface 

$condition = $true
if ( $condition )
{
    Write-Output "The condition was true"
}

#>

#!/usr/bin/osascript

tell application "Visual Studio Code"
    activate
    delay 2
    
    -- Open command palette and run CTDiscovery dashboard command
    tell application "System Events"
        key code 35 using {command down, shift down} -- Cmd+Shift+P for command palette
        delay 1
        
        type text "CTDiscovery: Open Dashboard"
        delay 0.5
        
        key code 36 -- Enter to execute command
        delay 3
        
        -- Take screenshot after opening dashboard
        do shell script "screencapture -x ~/Desktop/ctdiscovery-dashboard-fresh-" & (do shell script "date +%Y%m%d-%H%M%S") & ".png"
        
        -- Also test the scan command
        key code 35 using {command down, shift down} -- Cmd+Shift+P for command palette
        delay 1
        
        type text "CTDiscovery: Scan Development Environment"
        delay 0.5
        
        key code 36 -- Enter to execute command
        delay 2
    end tell
end tell
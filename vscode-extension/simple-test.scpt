#!/usr/bin/osascript

tell application "Visual Studio Code"
    activate
    delay 1
end tell

tell application "System Events"
    -- Open command palette
    key code 35 using {command down, shift down}
    delay 1
    
    -- Type and search for CTDiscovery commands
    type text "ctdiscovery"
    delay 2
    
    -- Take a screenshot to see what commands are available
    do shell script "screencapture -x ~/Desktop/ctdiscovery-command-palette-" & (do shell script "date +%Y%m%d-%H%M%S") & ".png"
    
    -- Press escape to close palette
    key code 53
end tell
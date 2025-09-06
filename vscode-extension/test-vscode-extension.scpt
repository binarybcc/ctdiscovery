#!/usr/bin/osascript

-- AppleScript to test CTDiscovery VSCode Extension
tell application "Visual Studio Code"
    activate
    delay 2
end tell

tell application "System Events"
    tell process "Visual Studio Code"
        
        -- Step 1: Launch Extension Development Host (F5)
        log "Step 1: Launching Extension Development Host..."
        key code 96 -- F5
        delay 5
        
        -- Step 2: Test Command Palette and CTDiscovery commands
        log "Step 2: Testing CTDiscovery commands..."
        key code 35 using {command down, shift down} -- Cmd+Shift+P
        delay 1
        
        keystroke "CTDiscovery: Scan Development Environment"
        delay 1
        key code 36 -- Return
        delay 3
        
        -- Step 3: Test Dashboard command
        log "Step 3: Testing Dashboard command..."
        key code 35 using {command down, shift down} -- Cmd+Shift+P
        delay 1
        
        keystroke "CTDiscovery: Open Dashboard"
        delay 1
        key code 36 -- Return
        delay 3
        
        -- Step 4: Test Generate AI Context command
        log "Step 4: Testing Generate AI Context command..."
        key code 35 using {command down, shift down} -- Cmd+Shift+P
        delay 1
        
        keystroke "CTDiscovery: Generate AI Context"
        delay 1
        key code 36 -- Return
        delay 3
        
        -- Step 5: Check Activity Bar for CTDiscovery icon
        log "Step 5: Checking Activity Bar..."
        -- Try to find and click the CTDiscovery icon in Activity Bar
        try
            click button 1 of group 1 of splitter group 1 of window 1
            delay 1
        on error
            log "Could not find CTDiscovery Activity Bar icon"
        end try
        
        -- Step 6: Open Developer Console to check for errors
        log "Step 6: Opening Developer Console..."
        key code 40 using {command down, shift down, option down} -- Cmd+Shift+Option+I
        delay 2
        
        log "Extension testing completed!"
        
    end tell
end tell
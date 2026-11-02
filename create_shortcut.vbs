Set WshShell = CreateObject("WScript.Shell")
Set oShellLink = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop") & "\MindFlow.lnk")

' Получаем путь к папке скрипта
scriptPath = Replace(WScript.ScriptFullName, WScript.ScriptName, "")
exePath = scriptPath & "build\win-unpacked\MindFlow.exe"
workDir = scriptPath & "build\win-unpacked"

' Проверяем существование exe
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(exePath) Then
    MsgBox "MindFlow.exe не найден!" & vbCrLf & vbCrLf & "Путь: " & exePath & vbCrLf & vbCrLf & "Сначала запустите CLEAN_BUILD.bat", 16, "Ошибка"
    WScript.Quit
End If

' Создаём ярлык
oShellLink.TargetPath = exePath
oShellLink.WorkingDirectory = workDir
oShellLink.IconLocation = exePath & ",0"
oShellLink.Description = "MindFlow - Mind Mapping Application"
oShellLink.WindowStyle = 1
oShellLink.Save

MsgBox "Ярлык создан на рабочем столе!" & vbCrLf & vbCrLf & "Путь: " & exePath, 64, "Успешно"

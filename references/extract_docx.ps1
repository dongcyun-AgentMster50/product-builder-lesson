$path = "C:\Users\YDC\product-builder-lesson\references\Full Prompt_previous version.docx"
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open($path)
$text = $doc.Content.Text
$doc.Close($false)
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
$text | Out-File -FilePath "$env:TEMP\docx_text.txt" -Encoding utf8

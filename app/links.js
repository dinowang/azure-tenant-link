(function () {
    var name = null;
    var directoryId = null;
    var bookmarkRoot = null;

    chrome.bookmarks.search("Azure Tenant Link", x => {
        if (x && x.length > 0) {
            bookmarkRoot = x[0];
        }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome
            .scripting
            .executeScript({
                target: { tabId: tabs[0].id }, 
                func: () => document.querySelector(".fxs-avatarmenu-header").getAttribute("title")
            },
            (result) => {
                // console.log(result);
                var title = result[0].result,
                    lines = title.split("\n"),
                    directoryInfo = lines[lines.length - 2].match(/^.*[：:]\s*(.*)\s\((.*)\)$/);
    
                name = directoryInfo[1];
                directoryId = directoryInfo[2];
    
                document.getElementById("info").value = name + "\nhttps://portal.azure.com/" + directoryId;
                document.getElementById("buttons").classList.remove("hide");
            });
    });

    function notify(message) {
        chrome.notifications.create(null, {
            type: "basic",
            title: "Azure Tenant Link",
            iconUrl: "../images/32.png",
            message: message
        });
    }

    function download(name, data) {
        var blob = new Blob([data], { type: "text/plain" });
        var temp = document.createElement("a");
        temp.download = name;
        temp.href = window.URL.createObjectURL(blob);
        temp.click();
    }
  
    document.getElementById('add').addEventListener('click', () => {
        var detail = {
            title: `${name} (Azure Portal)`,
            url: `https://portal.azure.com/${directoryId}`
        };
        if (bookmarkRoot) {
            detail.parentId = bookmarkRoot.id;
            chrome.bookmarks.create(detail, x => notify("Bookmark added, find it in Azure Tenant Link folder"));
        } else {
            chrome.bookmarks.create({ title: "Azure Tenant Link" }, x => {
                bookmarkRoot = x;
                detail.parentId = bookmarkRoot.id;
                chrome.bookmarks.create(detail, x => notify("Bookmark added, find it in Azure Tenant Link folder"));
            });
        }
    });

    document.getElementById('win').addEventListener('click', () => {
        var text = `[InternetShortcut]
    URL=https://portal.azure.com/${directoryId}`;
        download(name + " (Azure Portal).url", text);
    });

    document.getElementById('mac').addEventListener('click', () => {
        var text = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>URL</key>
        <string>https://portal.azure.com/${directoryId}</string>
    </dict>
</plist>`;
        download(name + " (Azure Portal).webloc", text);
    });

    document.getElementById('any').addEventListener('click', () => {
        var text = `<script>
location.href = "https://portal.azure.com/${directoryId}";        
</script>`;
        download(name + " (Azure Portal).html", text);
    });

    document.getElementById('md').addEventListener('click', () => {
        var text = `[${name} (Azure Portal)](https://portal.azure.com/${directoryId})`;
        navigator.clipboard.writeText(text).then(() => notify("Markdown link available in clipboard"));
    });

    document.getElementById('rtf').addEventListener('click', () => {
        var text = `<a href="https://portal.azure.com/${directoryId}">${name} (Azure Portal)</a>`;
        var item = new ClipboardItem({ "text/html": new Blob([text], { type: "text/html" }) });
        navigator.clipboard.write([item]).then(() => notify("Rich Text link available in clipboard"));
    });

})();
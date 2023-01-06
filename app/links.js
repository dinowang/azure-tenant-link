// const tab = chrome.tabs.query({ active: true, currentWindow: true });
// let result;
// try {
//     result = chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         function: () => getSelection().toString(),
//     });
//     console.log(result);
//     document.body.append('Selection: ' + result);
// } catch (e) {
//     //return; // ignoring an unsupported page like chrome://extensions
// }

(function () {

    var name = null;
    var directoryId = null;

    document.getElementById('win').addEventListener('click', function () {
        var text = `[InternetShortcut]
    URL=https://portal.azure.com/${directoryId}`;
        download(name + " (Azure Portal).url", text);
    });

    document.getElementById('mac').addEventListener('click', function () {
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

    function download(name, data) {
        var temp = document.createElement("a");
        temp.download = name;
        var blob = new Blob([data], {
            type: "text/plain"
        });
        temp.href = window.URL.createObjectURL(blob);
        temp.click();
    }
  
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        getAvatarTitle(tabs[0].id);
    });

    function getAvatarTitle(tabId) {
        chrome
            .scripting
            .executeScript({
                target: { tabId: tabId }, 
                func: () => document.querySelector(".fxs-avatarmenu-header").getAttribute("title")
            },
            (result) => {
                console.log(result);
                var title = result[0].result,
                    lines = title.split("\n"),
                    directoryInfo = lines[lines.length - 2].match(/^.*[：:]\s*(.*)\s\((.*)\)$/);

                name = directoryInfo[1];
                directoryId = directoryInfo[2];

                document.getElementById("info").value = name + "\nhttps://portal.azure.com/" + directoryId;
                document.getElementById("win").style.display = "inline-block";
                document.getElementById("mac").style.display = "inline-block";
            });
    }
})();
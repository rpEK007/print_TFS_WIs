document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#printButton').addEventListener('click', function (e) {
    e.preventDefault();
    chrome.tabs.query({active: true,currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'printTasks("' + document.querySelector('input[name="type"]:checked').value + '")'
      });
      close();
    });  
  }, false);
  document.querySelector('#instructionsButton').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('body').className = "showInstructions";
  }, false);
  document.querySelector('#optionsButton').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('body').className = "";
  }, false);
});
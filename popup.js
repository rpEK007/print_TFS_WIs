document.addEventListener('DOMContentLoaded', function () {
  var queries;

  pluck = function(arr, key) { 
    return arr.map(function(e) { return e[key]; }) 
  }
  function getQueries(baseUrl, callback) {
    $.ajax({
      url: baseUrl + 'queries?$depth=2&$expand=all&api-version=1.0',
      success: function (response) {
        callback(response.value);
      }
    });
  };
  
  chrome.tabs.getSelected(function(tab) {
    baseUrl = tab.url.split('/').splice(0, 6).join('/') + '/_apis/wit/';
    getQueries(baseUrl, fillQueriesSelect);
  });

  function fillQueriesSelect(queries) {
    var fragment = document.createDocumentFragment(),
        groupElement,
        subGroupElement,
        label,
        optionEl,
        firstLI,
        radioEl;

    function addOption(key, option) {
      optionEl = document.createElement('li');
      label = document.createElement('label');
      radioEl = document.createElement('input');

      radioEl.type = 'radio';
      radioEl.value = option.wiql;
      radioEl.name = 'query';
      // radioEl
      optionEl.appendChild(label);
      label.appendChild(radioEl);
      label.appendChild(document.createTextNode(option.name));

      subGroupElement.appendChild(optionEl);
    }
    function createUL(group) {
      element = document.createElement('ul');
      firstLI = document.createElement('li');
      firstLI.className = 'opener closed';
      firstLI.textContent = group.name;
      element.appendChild(firstLI);

      return element;
    }

    $.each(queries, function (key, group) {
      if (group.hasChildren) {
        groupElement = createUL(group);

        $.each(group.children, function (key, subGroup) {
          if (subGroup.isFolder) {
            if (subGroup.hasChildren) {
              subGroupElement = createUL(subGroup);

              $.each(subGroup.children, addOption);          
              groupElement.appendChild(subGroupElement);            
            }
          } else {
            subGroupElement = groupElement;
            addOption(null, subGroup);
          }
        });        

        fragment.appendChild(groupElement);
      }
    });

    $('#queriesContainer').html(fragment);
    $('.opener').click(function () {
      $(this).toggleClass('closed');
    })
  }

  $('#printButton').click(function (e) {
    var wiql = $(':checked').val();

    e.preventDefault();
    chrome.tabs.query({active: true,currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'printTasks("' + encodeURIComponent(wiql) + '");'
      });
      close();
    });  
  });

});
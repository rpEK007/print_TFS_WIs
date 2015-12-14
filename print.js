function generateBaseURL(withProject) {
	return location.origin + location.pathname.split('/').splice(0, withProject ? 4 : 3).join('/') + '/_apis/wit/';
};

printTasks = function (wiql) {
	var pluck = function(arr, key) { 
			return arr.map(function(e) { return e[key]; }) 
		},
		fields = [];

	$.ajax({
		url: generateBaseURL(true) + 'wiql?api-version=1.0',
		type: "POST",
		data: JSON.stringify({query: decodeURIComponent(wiql)}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (response) {
			var ids = pluck(response.workItems, 'id');
			
			if (!ids.length) {
				return alert('No items for current query');
			}

			$.get(
				generateBaseURL(false) + 'WorkItems?api-version=1.0&$expand=relations&ids=' + ids.join(','),
				function (items) {
					items.value.forEach(parseItem);
					printItems();
				}
			);
		}
	});

	function parseItem(item) {
		var result = {
				id: item.id,
				type: item.fields['System.WorkItemType'],
				assignee: item.fields['System.AssignedTo'] || '',
				title: item.fields['System.Title'],
				remainingWork: item.fields['Microsoft.VSTS.Scheduling.RemainingWork'] || '',
				parent: ''
			};

		if (item.relations) {
			item.relations.forEach(function (relation) {
				if (relation.rel === 'System.LinkTypes.Hierarchy-Reverse') {
					result.parent = relation.url.split('/').slice(-1)[0]
				}
			})
		}

		fields.push(result);
	}

	function printItems() {
		$('body').addClass('printView')
			.append(
				'<div id="printWrapper">' + 
					'<button id="goBack">Back To TFS</button>' + 
					'<div id="TFS-Tasks"></div>' + 
				'</div>'
			).find('#TFS-Tasks').html($.map(fields, createCardEl));

		$('#goBack').click(function () {
			$('body').removeClass('printView').find('#printWrapper').remove();

			script = document.createElement('script');
			script.textContent = '$(window).trigger("resize");';
			(document.head||document.documentElement).appendChild(script);
			script.parentNode.removeChild(script);
		});

		print();
	};

	function createCardEl(item) {
		return $(
			'<div class="tbTile ui-draggable propagate-keydown-event" tabindex="0" aria-disabled="false">' +
			    '<div class="tbTileContent">' +
			    	'<div style="font-weight: bold;">' + item.parent + '</div>' + 
			        '<div class="witTitle clickableTitle">' + item.id + ': ' + item.title + '</div>' +
			        '<div class="witExtra">' +
			            '<div class="onTileEditDiv non-combo-behavior witAssignedTo ellipsis">' +
			                '<div class="onTileEditTextDiv ellipsis">' + item.assignee + '</div>' +
			            '</div>' +
			            '<div class="onTileEditDiv non-combo-behavior witRemainingWork">' +
			                '<div class="onTileEditTextDiv">' + item.remainingWork + '</div>' +
			            '</div>' +
			        '</div>' +
			    '</div>' +
			'</div>'
		);
	};
};
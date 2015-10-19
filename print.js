printTasks = function (tag, scrollingSpeed) {
	BUG_COLOR = "rgb(204, 41, 61)";
	PBI_COLOR = "rgb(0, 156, 204)";

	containerEl = $('.ui-draggable');
	containerEl.scrollTop(0);

	setTimeout(fullfillContainer, 0);
	function onTaskGenerated(e) {
		containerClone.append($(e.target).clone());
	}

	function fullfillContainer() {
		scrollingSpeed = scrollingSpeed || 200;
		containerClone = containerEl.clone();
		containerEl.on('DOMNodeInserted', onTaskGenerated);
		scrollTop = 0;
		controlShots = 5;
		startProgress();
		interval = setInterval(scrollContainer, 40);
	};

	function scrollContainer() {
		scrollTop += scrollingSpeed
		containerEl.scrollTop(scrollTop);
		if (containerEl[0].scrollTop < scrollTop) {
			if (controlShots-- < 1) {
				clearInterval(interval);
				finishProgress();
			}
		} else {
			updateProgress(
				containerEl[0].scrollTop/
					(containerEl[0].scrollHeight - containerEl.parent().height())
			);
		}
	};

	function startProgress() {
		$('body').append('<div id="progressLayout"></div>' + 
			'<progress max="100" id="printProgress" value="0"></progress>');	
	};

	function updateProgress(progress) {
		$('#printProgress').val(+progress*100);
	};

	function finishProgress(progress) {
		containerEl.off('DOMNodeInserted', onTaskGenerated);
		$('body').addClass('printView').append('<div id="printWrapper"></div>').find('#printWrapper').append(containerClone);
		$('#progressLayout, #printProgress').remove();
		continuePrint();
	};

	function continuePrint() {
		currentStoryId = '';
		cards = [];

		if (/UI|BE|QC/.test(tag)) {
			printWorkItems();
		} else if (tag === 'BUG') {
			printDefects();
		} else {
			printStories();
		}

		fillPrintWrapper();
		containerClone.remove();
		containerClone = null;
		print();
	};

	function fillPrintWrapper() {
		$('#printWrapper').html('<button id="goBack">Back To TFS</button><div id="TFS-Tasks"></div>').find('#TFS-Tasks').html(cards);
		$('#goBack').click(function () {
			$('body').removeClass('printView').find('#printWrapper').remove();
			containerEl.scrollTop(0);

			script = document.createElement('script');
			script.textContent = '$(window).trigger("resize");';
			(document.head||document.documentElement).appendChild(script);
			script.parentNode.removeChild(script);
		});
	};

	function printWorkItems() {
		$('#printWrapper .grid-row-normal').each(function (key, el) {
			var $el = $(el);

			if ($el.hasClass('user-story-grid-row')) {
				currentStoryId = $el.children().eq(1).text();
			} else if ($el.find('.tag-item[title="' + tag + '"]').length) {
				cards.push(createCardEl($el, 4));
			}
		});
	};

	function printDefects() {
		printStoryLevelItems(BUG_COLOR);
	};

	function printStories() {
		printStoryLevelItems(PBI_COLOR);
	};

	function printStoryLevelItems(color) {
		$('#printWrapper .user-story-grid-row').each(function () {
			var $el = $(this);

			if ($el.find('.work-item-color').css('background-color') === color) {
				cards.push(createCardEl($el, 5));
			}
		});
	};

	function createCardEl($el, remainingWorkPosition) {
		var children = $el.children(),
			id = children.eq(1).text(),
			description = children.eq(2).text(),
			assignee = children.eq(3).text(),
			remainingWork = children.eq(remainingWorkPosition).text();
			
		return $('<div class="tbTile ui-draggable propagate-keydown-event" tabindex="0" aria-disabled="false">' +
			    '<div class="tbTileContent">' +
			    	'<div style="font-weight: bold;">' + currentStoryId + '</div>' + 
			        '<div class="witTitle ellipsis clickableTitle">' + id + ': ' + description + '</div>' +
			        '<div class="witExtra">' +
			            '<div class="onTileEditDiv non-combo-behavior witRemainingWork">' +
			                '<div class="onTileEditTextDiv ellipsis">' + remainingWork + '</div>' +
			            '</div>' +
			            '<div class="onTileEditDiv non-combo-behavior witAssignedTo ellipsis">' +
			                '<div class="onTileEditTextDiv ellipsis">' + assignee + '</div>' +
			            '</div>' +
			        '</div>' +
			    '</div>' +
			'</div>');
	};
};
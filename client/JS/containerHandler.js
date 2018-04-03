function getContainterHandler(parentElem) {
	if(!parentElem || !parentElem.children || parentElem.children.length === 0) throw 'Invalid parent element';

	var availableContainers = [];
	parentElem.children.forEach((elem) => {
		availableContainers.push(elem);
	});

	function focusContainerById(id) {
		for(var i = 0; i < availableContainers.length; i++) {
			if(availableContainers[i].id === id) {
				focusContainer(availableContainers[i]);
			} else {
				unfocusContainer(availableContainers[i]);
			}
		}
	}

	function focusContainerByIndex(idx) {
		for(var i = 0; i < availableContainers.length; i++) {
			if(i === idx) focusContainer(availableContainers[idx]);
			else unfocusContainer(availableContainers[i]);
		}
	}

	function focusContainer(elem) {
		elem.style.display = 'inherit';
	}

	function unfocusContainer(elem) {
		elem.style.display = 'none';
	}

	function defaultOnclickHandlers()

	return {
		focusContainerById: focusContainerById,
		focusContainerByIndex: focusContainerByIndex,
		focusContainerDirect: focusContainer,
		unfocusContainerDirect: unfocusContainer,
		setDefaultOnclickEvents: defaultOnclickHandlers
	}
}

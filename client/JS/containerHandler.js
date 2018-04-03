function getContainerHandler(parentElem) {
	if(!parentElem || !parentElem.children || parentElem.children.length === 0) throw 'Invalid parent element';

	var availableContainers = [];
	for(var i = 0; i < parentElem.children.length; i++) {
		if(!parentElem.children[i].classList.contains('cnthndl-ignore'))
			availableContainers.push(parentElem.children[i]);
	}

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

	function defaultOnclickHandlers(idSuffix) {
		availableContainers.forEach((container, i) => {
			var clickElem = document.getElementById(container.id + idSuffix);

			clickElem.onclick = focusContainerByIndex(i);
		});		
	}

	return {
		focusContainerById: focusContainerById,
		focusContainerByIndex: focusContainerByIndex,
		focusContainerDirect: focusContainer,
		unfocusContainerDirect: unfocusContainer,
		setOnclickEventsHandler: defaultOnclickHandlers
	}
}

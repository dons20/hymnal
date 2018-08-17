let toc = document.getElementById('toc'),
	song = document.getElementById('song'),
	back = document.getElementById('back'),
	modal = document.getElementById('overlay'),
	modalClose = modal.querySelector('.close'),
	modalBody = document.getElementById('modalBody');

let navigation = [],
	songArray = [];

/* Start Point */
populateNav();
loadJSON(data); //Data is assigned from songs.js

//Hide modal on Esc
document.addEventListener('keyup', (e) => {
	if (e.which == 27) modalClose.click();
});

modal.addEventListener('click', async () => {
	await (() => {
		return new Promise((resolve) => {
			resolve(modal.classList.remove('active'));
		});
	})();
	await delay(300);
	await (() => {
		return new Promise((resolve) => {
			resolve(modal.setAttribute('hidden', ''));
		});
	})();
});

modalClose.addEventListener('click', async () => {
	await (() => {
		return new Promise((resolve) => {
			resolve(modal.classList.remove('active'));
		});
	})();
	await delay(300);
	await (() => {
		return new Promise((resolve) => {
			resolve(modal.setAttribute('hidden', ''));
		});
	})();
});

back.addEventListener('click', async () => {
	toc.removeAttribute('hidden');
	song.setAttribute('hidden', '');
	back.setAttribute('disabled', '');
});

/**
 * Returns a delayed promise
 */
function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 *	Adds click listeners to spans in contents
 */
function populateNav() {
	navigation = toc.querySelectorAll('span');
	for (let i = 0; i < navigation.length; i++) {
		navigation[i].addEventListener('click', function() {
			let filter = this.innerText;
			showRecords(filter.replace(/-/g, ' '));
		});
	}
}

/**
 * Displays songs depending on filter
 */
function showRecords(filter) {
	let newFilter = filter.split(' ');
	while (modalBody.firstChild) {
		modalBody.removeChild(modalBody.firstChild);
	}
	if (newFilter === 'All') {
		let allFilter = [['1 443']].join();
		showRecords(allFilter);
	} else if (newFilter.length > 1) {
		//Display song titles by numbers
		for (let i = 0; i < newFilter[1]; i++) {
			let item = document.createElement('div');
			let number = document.createElement('span');
			number.classList += 'num';
			number.innerText = i + 1;
			item.appendChild(number);
			item.onclick = (function(j) {
				return function() {
					showSong(j);
				};
			})(i);
			item.innerText = songArray.songs[i].title;
			modalBody.append(item);
			item.appendChild(number);
		}
		modal.removeAttribute('hidden');
		modal.classList.add('active');
	} else {
		let length = Object.keys(songArray.songs).length;
		let array = [];
		//Display song titles by letter
		for (let i = 0; i < length; i++) {
			if (songArray.songs[i].title.charAt(0) === newFilter[0]) {
				array.push([songArray.songs[i].title, i]);
			}
		}
		array.sort(function(a, b) {
			return a[0].toUpperCase().localeCompare(b[0].toUpperCase());
		});

		for (let i = 0; i < array.length; i++) {
			let item = document.createElement('div');
			let number = document.createElement('span');
			number.classList += 'num';
			number.innerText = array[i][1] + 1;
			item.onclick = (function(j) {
				return function() {
					showSong(array[j][1]);
				};
			})(i);
			item.innerText = array[i][0];
			modalBody.append(item);
			item.appendChild(number);
		}
		modal.removeAttribute('hidden');
		modal.classList.add('active');
	}
}

/**
 * Creates DOM layout for song details
 */
function showSong(index) {
	let songInfo = songArray.songs[index];
	let songStruct = [];
	let orderSong = [];
	let number = songInfo.number;
	let title = songInfo.title;
	let verses = songInfo.verse;
	let chorus = songInfo.chorus;
	let author = songInfo.author;

	song.innerHTML = '';
	songStruct.push(number, title, verses, chorus, author);

	let ssLength = songStruct.length;
	let header = document.createElement('div');
	header.classList.add('songHeader');

	for (let i = 0; i < ssLength; i++) {
		switch (i) {
			case 0:
				if (songStruct[i]) {
					let newDiv = document.createElement('div');
					newDiv.classList.add('songNum');
					newDiv.innerText = songStruct[i];
					header.insertAdjacentElement('beforeend', newDiv);
				}
				break;
			case 1:
				if (songStruct[i]) {
					let newDiv = document.createElement('div');
					newDiv.classList.add('songTitle');
					newDiv.innerText = songStruct[i];
					header.insertAdjacentElement('afterbegin', newDiv);
					song.insertAdjacentElement('beforeend', header);
				}
				break;
			case 2:
				if (songStruct[i]) {
					let songLength = songStruct[i].length + 1;
					for (let j = 0; j < songLength; j++) {
						let newDiv = document.createElement('div');
						switch (j) {
							case 0:
								newDiv.classList += 'verse';
								newDiv.innerText = cleanupString(songStruct[i][j]);
								song.insertAdjacentElement('beforeend', newDiv);
								break;
							case 1:
								if (songStruct[3].length > 0) {
									newDiv.classList += 'chorus';
									newDiv.innerText = cleanupString(songStruct[3]);
									song.insertAdjacentElement('beforeend', newDiv);
								}
								break;
							default:
								newDiv.classList += 'verse';
								newDiv.innerText = cleanupString(songStruct[i][j - 1]);
								song.insertAdjacentElement('beforeend', newDiv);
								break;
						}
					}
				}
				break;
			case 4:
				if (songStruct[i]) {
					let newDiv = document.createElement('div');
					newDiv.classList += 'author';
					newDiv.innerText = songStruct[i];
					song.insertAdjacentElement('beforeend', newDiv);
				}
				break;
		}
	}

	toc.setAttribute('hidden', '');
	song.removeAttribute('hidden');
	back.removeAttribute('disabled');
	modalClose.click();

	return false;
}

/**
 * Remove dirty characters, spaces from string
 */
function cleanupString(string) {
	let newString = string
		.replace(/\*/g, '')
		.replace(/\s{2,}/g, '\n')
		.trim();
	return newString;
}

/**
 * Checks for empty string
 */
function isEmpty(str) {
	return !str || 0 === str.length;
}

/**
 * Loads JSON info into local storage and populates songArray
 */
function loadJSON(file) {
	if (localStorage.getItem('songs') === null) {
		localStorage.setItem('songs', JSON.stringify(file));
	}
	songArray = JSON.parse(localStorage.getItem('songs'));
}

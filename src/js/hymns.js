let toc = document.getElementById('toc'),
	song = document.getElementById('song'),
	back = document.getElementById('back'),
	overlay = document.getElementById('overlay'),
	modal = document.getElementById('modal'),
	modalClose = modal.getElementsByClassName('modal__close')[0],
	refresh = document.getElementById('refresh'),
	navbar = document.getElementById('navbar'),
	modalBody = document.getElementById('modalBody');

let songArray = [];

/* Start Point */
initializeSongs();
populateNav();

//Hide modal on Esc
document.addEventListener('keyup', (e) => {
	if (e.which == 27) modalClose.click();
});

overlay.addEventListener('click', () => {
	showModal(false);
});

modalClose.addEventListener('click', () => {
	showModal(false);
});

modalBody.addEventListener('click', (e) => {
	if (e.target.classList.contains('modal__item')) {
		let i = modal.querySelector('.modal__num').innerText;
		showSong(i);
	}
}, false);

back.addEventListener('click', () => {
	toc.removeAttribute('hidden');
	song.setAttribute('hidden', '');
	back.setAttribute('disabled', '');
});

refresh.addEventListener('click', () => {
	localStorage.removeItem('songs');
	location.reload(true);
});

/**
 *	Adds click listeners to spans in contents
 */
function populateNav() {
	navbar.addEventListener('click', (e) => {
		if (e.target.classList.contains('content__nav-span')) {
			let filter = e.target.innerText;
			filter = filter.replace(/-/g, ' ');
			filter = filter.split(/\s+/);
			showRecords(filter);
		}
	}, false);
}

/**
 * Displays songs depending on filter
 */
function showRecords(filter) {
	showModal(true);
	while (modalBody.firstChild) {
		modalBody.removeChild(modalBody.firstChild);
	}
	console.log(filter);
	if (filter[0] === 'All') {
		let totalFilter = songArray.length;
		//Display song titles by numbers
		for (let i = 0; i < totalFilter; i++) {
			let item = document.createElement('div');
			let number = document.createElement('span');
			number.classList.add('modal__num');
			number.innerText = i + 1;
			item.insertAdjacentElement('beforeend', number);
			item.classList.add('modal__item');
			item.innerText = songArray[i].title;
			modalBody.insertAdjacentElement('beforeend', item);
			item.insertAdjacentElement('beforeend', number);
		}
	} else if (Number.isInteger(Number.parseInt(filter[0]))) {
		for (let i = Number.parseInt(filter[0]) - 1; i < Number.parseInt(filter[1]); i++) {
			let item = document.createElement('div');
			let number = document.createElement('span');
			number.classList.add('modal__num');
			number.innerText = i + 1;
			item.insertAdjacentElement('beforeend', number);
			item.classList.add('modal__item');
			item.innerText = songArray[i].title;
			modalBody.insertAdjacentElement('beforeend', item);
			item.insertAdjacentElement('beforeend', number);
		}
	} else {
		//Display song titles by letter
		let length = Object.keys(songArray).length;
		let array = [];
		for (let i = 0; i < length; i++) {
			if (songArray[i].title.charAt(0) === filter[0]) {
				array.push([songArray[i].title, i]);
			}
		}
		array.sort(function(a, b) {
			return a[0].toUpperCase().localeCompare(b[0].toUpperCase());
		});

		for (let i = 0; i < array.length; i++) {
			let item = document.createElement('div');
			let number = document.createElement('span');
			number.classList.add('modal__num');
			number.innerText = array[i][1] + 1;
			item.classList.add('modal__item');
			item.innerText = array[i][0];
			modalBody.insertAdjacentElement('beforeend', item);
			item.insertAdjacentElement('beforeend', number);
		}
	}
}

function showModal(state) {
	if (state) {
		modal.classList.add('modal--active');
		overlay.classList.add('overlay--active');
	} else {
		modal.classList.remove('modal--active');
		overlay.classList.remove('overlay--active');
	}
}

/**
 * Creates DOM layout for song details
 */
function showSong(index) {
	let songInfo = songArray[index],
		songStruct = [],
		//orderSong = [],
		number = songInfo.number,
		title = songInfo.title,
		verses = songInfo.verse,
		chorus = songInfo.chorus,
		author = songInfo.author;

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
 * Loads JSON info into local storage and populates songArray
 */
async function initializeSongs() {
	//Check if songs has been stored already
	if (!localStorage.hasOwnProperty('songs')) {
		//Create songs from file
		console.info('Searching for list of songs...');
		await createSongs();
	}
	songArray = await pullFromStorage();
	await createDOM();

	function createDOM() {
		return new Promise((resolve) => {
			let startingLetters = [];
			let songArrayCopy = songArray.slice();
			let elementArray = [];

			for (let i = 0; i < 26; i++) {
				startingLetters.push(String.fromCharCode('A'.charCodeAt() + i));
			}
			//Display all songs
			elementArray.push(addElement('All'));
			appendElements(elementArray);
			elementArray = [];

			//Display song per letter
			for (let k = 0; k < startingLetters.length; k++) {
				if (songArray.some(ele => ele.title.charAt(0) === startingLetters[k])) {
					elementArray.push(addElement(startingLetters[k]));
				}
			}
			appendElements(elementArray);
			elementArray = [];

			//Display song per number
			for (let i = 0, l = Math.floor(songArray.length / 100), max = null; i <= l; i++) {
				max = songArrayCopy.length > 100 ? 99 : songArrayCopy.length - 1;
				elementArray.push(addElement(`${songArrayCopy[0].number} - ${songArrayCopy[max].number}`));
				songArrayCopy.splice(0, max + 1);
			}
			appendElements(elementArray);
			elementArray = [];
			
			resolve();
		});
	}

	function addElement(value) {
		let navSpan = document.createElement('span');
		navSpan.classList.add('content__nav-span');
		navSpan.innerText = value;
		return navSpan;
	}

	function appendElements(elements) {
		let navItem = document.createElement('div');
		navItem.classList.add('content__nav-item');
		for (let x of elements) {
			navItem.appendChild(x);
		}
		navbar.insertAdjacentElement('beforeend', navItem);
	}

	function pullFromStorage() {
		return new Promise((resolve) => {
			console.info('Loading songs into memory...');
			resolve(JSON.parse(localStorage.getItem('songs')));
		});
	}

	async function createSongs() {
		let file = await createData();
		await processData(file);

		return new Promise((resolve) => {
			resolve();
		}).catch((err) => {
			console.error(err);
		});
	}

	function createData() {
		return new Promise(async (resolve) => {
			let url = 'js/songs.json';
			let response = await fetch(url);
			if (response.ok) {
				console.info('Song database found!');
				resolve(response.json());
			} else {
				throw `File "${url}" not found on server!`;
			}
		}).catch((err) => {
			console.error(err);
		});
	}

	function processData(file) {
		return new Promise((resolve) => {
			console.info('Loading song data...');
			localStorage.setItem('songs', JSON.stringify(file));
			resolve();
		});
	}
}
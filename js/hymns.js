let toc = document.getElementById('toc'),
	song = document.getElementById('song'),
	back = document.getElementById('back'),
	modal = document.getElementById('overlay'),
	modalClose = modal.querySelector('.close'),
	refresh = document.getElementById('refresh'),
	modalBody = document.getElementById('modalBody');

let navigation = [],
	songArray = [];

/* Start Point */
populateNav();
initializeSongs();

//Hide modal on Esc
document.addEventListener('keyup', (e) => {
	if (e.which == 27) modalClose.click();
});

modal.addEventListener('click', async () => {
	showModal(false);
});

modalClose.addEventListener('click', async () => {
	showModal(false);
});

back.addEventListener('click', async () => {
	toc.removeAttribute('hidden');
	song.setAttribute('hidden', '');
	back.setAttribute('disabled', '');
});

refresh.addEventListener('click', () => {
	localStorage.removeItem('songs');
	location.reload(true);
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
			filter = filter.replace(/-/g, ' ');
			filter = filter.split(' ');
			console.log(filter);
			showRecords(filter);
		});
	}
}

/**
 * Displays songs depending on filter
 */
function showRecords(filter) {
	while (modalBody.firstChild) {
		modalBody.removeChild(modalBody.firstChild);
	}
	if (filter[0] === 'All') {
		let totalFilter = songArray.length;
		//Display song titles by numbers
		for (let i = 0; i < totalFilter; i++) {
			let item = document.createElement('div');
			let number = document.createElement('span');
			number.classList.add('num');
			number.innerText = i + 1;
			item.appendChild(number);
			item.onclick = (function(j) {
				return function() {
					showSong(j);
				};
			})(i);
			item.innerText = songArray[i].title;
			modalBody.append(item);
			item.appendChild(number);
		}
	} else if (Number.isInteger(Number.parseInt(filter[0]))) {
		for (let i = Number.parseInt(filter[0]) - 1; i < Number.parseInt(filter[1]); i++) {
			let item = document.createElement('div');
			let number = document.createElement('span');
			number.classList.add('num');
			number.innerText = i + 1;
			item.appendChild(number);
			item.onclick = (function(j) {
				return function() {
					showSong(j);
				};
			})(i);
			item.innerText = songArray[i].title;
			modalBody.append(item);
			item.appendChild(number);
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
	}
	showModal(true);
}

async function showModal(state) {
	if (state) {
		await (() => {
			return new Promise((resolve) => {
				modal.removeAttribute('hidden');
				resolve();
			});
		})();

		await delay(10);

		await (() => {
			return new Promise((resolve) => {
				modal.classList.add('active');
				resolve();
			});
		})();
	} else {
		await (() => {
			return new Promise((resolve) => {
				modal.classList.remove('active');
				resolve();
			});
		})();

		await delay(300);

		await (() => {
			return new Promise((resolve) => {
				modal.setAttribute('hidden', '');
				resolve();
			});
		})();
	}
}

/**
 * Creates DOM layout for song details
 */
function showSong(index) {
	let songInfo = songArray[index],
		songStruct = [],
		orderSong = [],
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
 * Checks for empty string
 */
function isEmpty(str) {
	return !str || 0 === str.length;
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

	function pullFromStorage() {
		return new Promise((resolve) => {
			console.info('Loading songs into memory...');
			resolve(JSON.parse(localStorage.getItem('songs')));
		});
	}

	async function createSongs() {
		let file = await createData();
		await processData(file);

		return new Promise((resolve, reject) => {
			resolve();
		}).catch((err) => {
			console.error(err);
		});
	}

	function createData() {
		return new Promise(async (resolve, reject) => {
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
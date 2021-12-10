/* Base URL */
const API_URL =  "https://api.coinbase.com/v2"
const LOCAL_URL = "http://localhost:3000"

/* General API */
function getAllCurrency() {
	return fetch(`${API_URL}/currencies`)
	.then(res => {
		return res.json();
	}).then(json => {
		return json.data;
	}) 
}

/* Member Section */
function localGetWatchList() {
	return fetch(`${LOCAL_URL}/watch-list`)
	.then(res => {
		return res.json();
	}).then(json => {
		return json;
	});
}

function localSaveWatchList(id, name) {
	return fetch(`${LOCAL_URL}/watch-list`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		body: JSON.stringify({id, name})
	})
}

function localRemoveWatchList(id) {
	return fetch(`${LOCAL_URL}/watch-list/${id}`, {
		method: 'DELETE'
	})
}

function refreshWatchList() {
	let table = document.querySelector('#watch-list tbody');
	localGetWatchList().then(wArr => {
		if (wArr.length === 0) {
			table.innerHTML = "";
			let warning = document.createElement('p');
			warning.innerHTML = `<p style="color:yellow; text-align:center;">There is no currency in your WATCH LIST!</p>`
			document.querySelector("#watch-list > .search-result").innerHTML = "";
			document.querySelector("#watch-list > .search-result").appendChild(warning);
		} else {
			table.innerHTML = "";
			wArr.forEach(w => {
				let col = document.createElement('tr');
				col.setAttribute('id', `${w.id}`);
				Promise.all([buy(w.id), sell(w.id)]).then(res => {
					col.innerHTML =
							`<th scope="row">${w.id}</th>
								<td>${w.name}</td>
								<td class="watch-list-buy" style="color:green">${res[0]}</td>
								<td class="watch-list-sell" style="color:red">${res[1]}</td>
								<td>
									<button type="button" class="button">
										<i class="far fa-times-circle"></i>
									</button>
							</td>`
				}).catch(_ => {
					col.innerHTML =
							`<tr id=${w.id}>
								<th scope="row">${w.id}</th>
								<td>${w.name}</td>
								<td class="watch-list-buy" style="color:green">Unexpected Error</td>
								<td class="watch-list-sell" style="color:red">Unexpected Error</td>
								<td>
									<button type="button" class="button">
										<i class="far fa-times-circle"></i>
									</button>
								</td>
							</tr>`
				}).finally(_ => {
					col.querySelector('button').addEventListener('click', () => {
						localRemoveWatchList(w.id).then(_ => {
							refreshWatchList();
							refreshCurrencyList();
						}).catch(_ => {
							alert("Unexpected Error");
						});
					})
				})
				table.appendChild(col);
			})
		}
	})

	// update time
	document.querySelector('#updated-time').innerHTML = `Last updated: ${new Date().toLocaleTimeString()}`;
}

function refreshCurrencyList() {
	let currencyList = document.querySelector('#currency-list');
	getAllCurrency().then(cArr => {
		cArr.forEach(c => {
			let currency = document.createElement('li');
			localGetWatchList().then(wArr => {
				if (wArr.some(val => {return val.id.includes(c.id);})) {
					currency.innerHTML = `${c.id}` 
				} else {
					currency.innerHTML = `<span>${c.id}<span> <button type="button" class="button"><i class="fas fa-plus-circle fa"></i></button>`;
					currency.querySelector('button').addEventListener('click', () => {
						localSaveWatchList(`${c.id}`, `${c.name}`).then(_ => {
							refreshWatchList();
							refreshCurrencyList();
						}).catch(_ => {
							alert("Unexpected Error");
						});
					});
				}
			}).catch(_ => {
				alert("Unexpected Error");
			});
			currencyList.querySelector('ul').appendChild(currency);
		})
	})
}

function updateWatchList() {
	const watchList = document.querySelectorAll('tbody tr');
	watchList.forEach(w => {
		Promise.all([buy(w.id), sell(w.id)]).then(res => {
			w.querySelector('.watch-list-buy').innerText = `${res[0]}`;
			w.querySelector('.watch-list-sell').innerText = `${res[1]}`;
		}).catch(_ => {
			w.querySelector('.watch-list-buy').innerText = "Unexpected Error";
			w.querySelector('.watch-list-sell').innerText = "Unexpected Error";
		})
	})
}

/* User Section */
function buy(currency) {
	return fetch(`${API_URL}/prices/BTC-${currency}/buy`)
	.then(res => {
		return res.json();
	}).then(json => {
		return json.data.amount;
	});
}

function sell(currency) {
	return fetch(`${API_URL}/prices/BTC-${currency}/sell`)
	.then(res => {
		return res.json();
	}).then(json => {
		return json.data.amount;
	});
}

function spot(currency, date=new Date().toISOString().split('T')[0]) {
	return fetch(`${API_URL}/prices/BTC-${currency}/spot?date=${date}`)
	.then(res => {
		return res.json();
	}).then(json => {
		return(json.data.amount);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	/* Get Watch List and Currency List */
	refreshWatchList();
	setInterval(function() {
		updateWatchList();
	}, 60000);
	refreshCurrencyList();

	/* Currency Selector */
	let currencySelector = document.querySelectorAll('.currency-selector');
	getAllCurrency().then(cArr => {
		cArr.forEach(c => {
			currencySelector.forEach(cs => {
				let option = document.createElement('option');
				option.value = c.id;
				option.innerText = `[${c.id}] ${c.name}`;
				cs.appendChild(option);
			})
		})
	})

	/* Buy/Sell Search */
	let buySellDiv = document.querySelector('#buy-sell');

	buySellDiv.querySelector('.action-selector').addEventListener('change', () => {
		if (buySellDiv.querySelector('.action-selector').value === "buy") {
			buySellDiv.querySelector('button').className = 'btn btn-success';
		} else if (buySellDiv.querySelector('.action-selector').value === "sell") {
			buySellDiv.querySelector('button').className = 'btn btn-danger';
		} else {
			buySellDiv.querySelector('button').className = 'btn btn-primary';
		}
	})

	buySellDiv.querySelector('button').addEventListener('click', () => {
		let currency = buySellDiv.querySelector('.currency-selector').value;
		let action = buySellDiv.querySelector('.action-selector').value;
		if (currency === "select €£$¥") {
			buySellDiv.querySelector('.search-result').innerHTML = `<p style="color:yellow">Select One Currency</p>`;
		} else if (action === "action") { 
			buySellDiv.querySelector('.search-result').innerHTML = `<p style="color:yellow">Select Buy or Sell</p>`;
		} else {
			if (action === "buy") {
				buy(currency).then(res => {
					buySellDiv.querySelector('.search-result').innerHTML = `<p>${new Date().toLocaleTimeString()}<br/>Buy: ${res} ${currency} => 1₿</p>`;
				}).catch(_ => {
					buySellDiv.querySelector('.search-result').innerHTML = `<p style="color:red">Unexpected Error</p>`;
				})
			} else if (action === "sell") {
				sell(currency).then(res => {
					buySellDiv.querySelector('.search-result').innerHTML = `<p>${new Date().toLocaleTimeString()}<br/>Sell: 1₿ => ${res} ${currency}</p>`;
				}).catch(_ => {
					buySellDiv.querySelector('.search-result').innerHTML = `<p style="color:red">Unexpected Error</p>`;
				})
			}
		}
	})

	/* Spot Search */
	let spotDiv = document.querySelector('#spot');
	spotDiv.querySelector('button').addEventListener('click', () => {
		let currency = spotDiv.querySelector('select').value;
		let date = spotDiv.querySelector('input').value;
		if (currency === "select €£$¥") {
			spotDiv.querySelector('.search-result').innerHTML = `<p style="color:yellow">Select One Currency</p>`;
		} else if (!isValidDate(date)) { 
			spotDiv.querySelector('.search-result').innerHTML = `<p style="color:red">Invalid Date</p>`;
		} else {
			spot(currency, date).then(res => {
				spotDiv.querySelector('.search-result').innerHTML = `<p>${date}<br/>Spot: ${res} ${currency}</p>`;
			}).catch(_ => {
				spotDiv.querySelector('.search-result').innerHTML = `<p style="color:red">Unexpected Error</p>`;
			})
		}
	})
});

/* Helper Functions */
function isValidDate(dateString) {
	let t = new Date();
	let regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!dateString.match(regEx)) return false;  // Invalid format
	let d = new Date(dateString);
	let dNum = d.getTime();
	if (d >= t) return false;
	if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
	return d.toISOString().slice(0,10) === dateString;
}
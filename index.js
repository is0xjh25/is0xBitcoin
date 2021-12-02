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

function localSaveWatchList(obj) {
	return fetch(`${LOCAL_URL}/watch-list`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		body: JSON.stringify(obj)
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
				Promise.all([buy(w.id), sell(w.id)]).then(res => {
					col.innerHTML =
						`<th scope="row">${w.id}</th>
						<td>${w.name}</td>
						<td style="color:green">${res[0]}</td>
						<td style="color:red">${res[1]}</td>
						<td>
							<button type="button" class="button" onclick="download()">
								<i class="far fa-times-circle"></i>
							</button>
						</td>`;
					table.appendChild(col);
				}).catch(_ => {
					col.innerHTML =
						`<th scope="row">${w.id}</th>
						<td>${w.name}</td>
						<td style="color:green">Unexpected Error</td>
						<td style="color:red">Unexpected Error</td>
						<td>
							<button type="button" class="button" onclick="download()">
								<i class="far fa-times-circle"></i>
							</button>
						</td>`;
					table.appendChild(col);
				})
			})
		}
	})
	document.querySelector('#updated-time').innerHTML = `Last updated: ${new Date().toLocaleTimeString()}`;
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
	refreshWatchList();
	/* Get All Currencies */
	let currencySelector = document.querySelectorAll('.currency-selector');
	let currencyList = document.querySelector('#currency-list');
	getAllCurrency().then(cArr => {
		cArr.forEach(c => {
			let currency = document.createElement('li');
			currency.innerHTML = `${c.id} <button type="button" class="button""><i class="fas fa-plus-circle fa"></i></button>`;
			currencyList.querySelector('ul').appendChild(currency);
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

function handleClick2() {
	return fetch("http://localhost:3000/posts/1", {
		method: 'PATCH',
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			test: "test",
			test2: "123"
		})
	})
	.then(res => {
		return res.json();
	}).then(json => console.log(json));
}
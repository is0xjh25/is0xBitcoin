// Base URL;
const API_URL =  "https://api.coinbase.com/v2"
const LOCAL_URL = "http://localhost:3000"

// General
function getAllCurrency() {
	return fetch(`${API_URL}/currencies`)
	.then(res => {
		return res.json();
	}).then(json => {
		return json.data;
	}) 
}

function saveCurrency(obj) {
	return fetch(`${LOCAL_URL}/currency-list`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		body: JSON.stringify(obj)
	})
}

// Member


// User
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
	document.querySelector('#test').addEventListener('click', () => {
		saveAllCurrency();
	})
	document.querySelector('#test2').addEventListener('click', () => {
		getAllCurrency().then(res => console.log(res));
	})
})

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
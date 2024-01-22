const clientId = "1923b8320b61461caf48c1b6957a9993";
const uri = "http://axiomatic-income.surge.sh";
let token;

const Spotify = {
	getAccessToken() {
		if (token) {
			return token;
		}

		const access = window.location.href.match(/access_token=([^&]*)/);
		const expire = window.location.href.match(/expires_in=([^&]*)/);

		if (access && expire) {
			token = access[1];
			const time = Number(expire[1]);
			window.setTimeout(() => token = '', time * 1000);
			window.history.pushState('Access Token', null, '/');
			return token;
		} else {
			window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${uri}`;
		}
	},

	search(term) {
		const accessToken = Spotify.getAccessToken();
		return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, { 
				headers: { Authorization: `Bearer ${accessToken}` } 
			}).then(response => 
				response.json() 
			).then(jsonResponse => {
				if (!jsonResponse.tracks) {
					return [];
				}
				
				return jsonResponse.tracks.items.map(track => ({
						id: track.id,
						name: track.name,
						artist: track.artist[0].name,
						album: track.album.name,
						uri: track.uri
					})
				);
			}
		);
	},

	savePlaylist(name, uris) {
		if (!name || !uris.length) {
			return;
		}

		const access = Spotify.getAccessToken();
		const headers = { Authorization: `Bearer ${access}` };
		let uid;
		return fetch("https://api.spotify.com/v1/me", { headers: headers }
			).then(response =>
				response.json()
			).then(jsonResponse => {
				uid = jsonResponse.id;
				return fetch(`https://api.spotify.com/v1/users/${uid}/playlists`, {
						headers: headers,
						method: "POST",
						body: JSON.stringify({ name: name })
					}).then(response =>
						response.json()
					).then(jsonResponse => {
						const playlistID = jsonResponse.id;
						return fetch(`https://api.spotify.com/v1/users/${uid}/playlists/${playlistID}/tracks`, {
								headers: headers,
								method: "POST",
								body: JSON.stringify({ uris: uris })
							}
						);
					}
				);
			}
		);
	}
};

export default Spotify;
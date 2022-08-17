
# better-spotify-api


#### Installation

```
npm intall better-spotify-api 
```

## Usage

### Without ClientID and clientSecret
```js
const Spotify = require("better-spotify-api");

let spotify = new Spotify()


//You can provide spotify url as well as query too
let data  = await spotify.search("https://open.spotify.com/playlist/1MuDVTTNqRmEUV1dzyfMnB?si=ffbe046d6b0c478b")

let song = await Spotity.search("Tum hi aana");


```




### With ClientID and clientSecret
```js
const Spotify = require("better-spotify-api");

let spotify = new Spotify({
    clientID:"cb41529dc3bd4d8f8a240dbee0fff4e8",
    clientSecret:"bcca82f42930498aa385a8289fdf276b"
})


//You can provide spotify url as well as query too
let data  = await spotify.search("https://open.spotify.com/playlist/1MuDVTTNqRmEUV1dzyfMnB?si=ffbe046d6b0c478b")

let song = await Spotity.search("Tum hi aana");
```

## [Donate us](https://ko-fi.com/parasdev)


## [Discord Server](https://discord.gg/ghysw8CPBf)
# [Work in progress]

# Plugin Title from API
Plugin to fetch the title from API by using the embed code and display it on the player.

## Build
Steps to build

- run `npm install`
- run `gulp`
- Use plugin created in `dist` folder

## Usage
* Add the script generated
```{html}
<script src="dist/title-plugin.min.js"></script>
```

Add info in player params before create the player

```{javascript}
var playerParam = {
  ...
  'title-plugin' : {
    'search_url' : 'https://search....',
    'embed_code' : 'ticmE3dzpE82YyDNJH_3...',
  }
}
```

where **title-plugin** is the property required for plugin to work, the info needed here is:

- **search-url** : is url used to fetch the search information
- **embed_code** : video asset identifier



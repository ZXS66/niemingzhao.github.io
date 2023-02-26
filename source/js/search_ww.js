///// web worker for searching post

let searchStore = [];

/** event listener for the web worker */
onmessage = async e => {
  let { action, data } = e.data;
  if (typeof action === "string" && action.length) {
    action = action.toUpperCase().trim();
    switch (action) {
      case "INIT":
        // initialization
        // fetch posts' indexing file
        if (!(Array.isArray(searchStore) && searchStore.length)) {
          // no re-init
          const response = await fetch(data);
          const content = await response.json();
          searchStore = content || [];
        }
        break;
      case "SEARCH":
      case "QUERY":
      default:
        // perform search with user input keyword
        let value = (data || "").toLowerCase();
        if (value.length === 0) {
          return;
        }
        // TODO: implement advanced search algorithm
        // reference: https://stackoverflow.com/questions/5859561/getting-the-closest-string-match
        // searchStore is sorted by time
        const matchedPosts = [];
        const maxContentLength = 256;
        const maxPostAmount = 10;
        // matched with title
        searchStore.forEach(_ => {
          if (matchedPosts.length >= maxPostAmount) return; // maximum
          if (_.title.toLowerCase().includes(value)) {
            let startIdx = _.content.toLowerCase().indexOf(value);
            if (startIdx < maxContentLength / 3) {
              startIdx = 0;
            } else {
              startIdx = startIdx - parseInt(maxContentLength / 3);
            }
            matchedPosts.push(
              Object.assign({}, _, {
                content: _.content
                  .substr(startIdx, maxContentLength)
                  .trim()
                  .replace(/\n/gi, " ")
              })
            );
          }
        });
        // TODO: matched tag
        // matched with content
        if (matchedPosts.length < maxPostAmount) {
          searchStore.forEach(_ => {
            if (matchedPosts.length >= maxPostAmount) return; // maximum
            if (matchedPosts.some(p => p.url === _.url)) return; // duplicate
            if (_.content.toLowerCase().includes(value)) {
              let startIdx = _.content.toLowerCase().indexOf(value);
              if (startIdx < maxContentLength / 3) {
                startIdx = 0;
              } else {
                startIdx = startIdx - parseInt(maxContentLength / 3);
              }
              matchedPosts.push(
                Object.assign({}, _, {
                  content: _.content
                    .substr(startIdx, maxContentLength)
                    .trim()
                    .replace(/\n/gi, " ")
                })
              );
            }
          });
        }
        postMessage(matchedPosts);
        break;
    }
  } else {
    console.log("please specify action when invoking search web worker!");
  }
};

// Deploy this to a CF worker after launching
addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

/**
 * Parse the response from the Heroku app
 */
async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return JSON.stringify(await response.json());
  } else if (contentType.includes('application/text')) {
    return response.text();
  } else if (contentType.includes('text/html')) {
    return response.text();
  } else {
    return response.text();
  }
}

/**
 * Many more examples available at:
 *   https://developers.cloudflare.com/workers/examples
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const url = new URL(request.url)
  const params = new Proxy(new URLSearchParams(url.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const tubeUrl = params.url;
    const youTubeDlData = await fetch('https://chinese-youtube.herokuapp.com/api/info?url=' + tubeUrl, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
    const results = await gatherResponse(youTubeDlData);
    const playUrl = JSON.parse(results).info.formats[0].url
    return fetch(playUrl);
}

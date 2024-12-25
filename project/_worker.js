export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/convert" && request.method === "POST") {
      const requestData = await request.json();
      const urls = requestData.urls;

      if (!Array.isArray(urls)) {
        return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
      }

      const convertedUrls = urls.map((githubUrl) => convertToJsDelivr(githubUrl));
      return new Response(JSON.stringify({ convertedUrls }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  },
};

function convertToJsDelivr(githubUrl) {
  try {
    const url = new URL(githubUrl);
    const pathParts = url.pathname.split("/").filter((part) => part);

    if (url.hostname !== "github.com" || pathParts.length < 3) {
      return { original: githubUrl, error: "Invalid GitHub URL" };
    }

    const [owner, repo, ...rest] = pathParts;
    const branch = rest[0] === "blob" || rest[0] === "tree" ? rest[1] : "main";
    const filePath = rest.slice(2).join("/");

    const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`;
    return { original: githubUrl, converted: cdnUrl };
  } catch (error) {
    return { original: githubUrl, error: "Error parsing URL" };
  }
}

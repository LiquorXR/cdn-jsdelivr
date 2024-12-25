export async function onRequest(context) {
    const { request } = context;
    if (request.method === 'POST') {
        const body = await request.json();
        const urls = body.urls || [];
        const results = urls.map(url => {
            const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/;
            const match = url.match(regex);
            if (match) {
                const [, user, repo, branch, filePath] = match;
                return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${filePath}`;
            }
            return `Invalid URL: ${url}`;
        });
        return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response("Only POST method is supported", { status: 405 });
}

const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "one.bingr.stremio.addon",
    version: "1.0.0",
    name: "Bingr Stream",
    description: "Stream movies and series directly from Bingr.one",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
    const { type, id } = args;

    try {
        const response = await axios.get("https://bingr.one/api/get-stream", {
            params: { type, imdb: id },
            timeout: 7000
        });

        if (response.data && Array.isArray(response.data.servers)) {
            const streams = response.data.servers.map(server => ({
                name: `Bingr | ${server.name || "Server"}`,
                title: `${server.resolution || "1080p"} - ${server.quality || "HD"}`,
                url: server.directUrl
            }));

            return { streams };
        }
    } catch (error) {
        console.error("Error fetching streams:", error.message);
    }

    return { streams: [] };
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

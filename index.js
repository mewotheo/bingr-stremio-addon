const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "one.bingr.stremio.addon",
    version: "1.0.0",
    name: "Bingr Stream",
    description: "Stream movies and series directly inside Stremio player",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);
const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

builder.defineStreamHandler(async (args) => {
    const { type, id } = args;

    try {
        let imdbId = id;
        let season = 1;
        let episode = 1;

        if (type === "series" && id.includes(":")) {
            const parts = id.split(":");
            imdbId = parts[0];
            season = parts[1];
            episode = parts[2];
        }

        const tmdbRes = await axios.get(`https://api.themoviedb.org/3/find/${imdbId}`, {
            params: {
                api_key: TMDB_API_KEY,
                external_source: "imdb_id"
            },
            timeout: 5000
        });

        let tmdbId = null;
        if (type === "movie" && tmdbRes.data.movie_results?.length > 0) {
            tmdbId = tmdbRes.data.movie_results[0].id;
        } else if (type === "series" && tmdbRes.data.tv_results?.length > 0) {
            tmdbId = tmdbRes.data.tv_results[0].id;
        }

        if (tmdbId) {
            // رابط الصفحة لفتحها بضغط زر في المشغل الداخلي
            const embedUrl = type === "movie" 
                ? `https://bingr.one/watch/movie/${tmdbId}`
                : `https://bingr.one/watch/tv/${tmdbId}/${season}/${episode}`;

            return {
                streams: [
                    {
                        name: "Bingr 1080p",
                        title: `Bingr Stream - Auto Play`,
                        url: embedUrl // استخدام url يجعله يفتح داخل المشغل المباشر
                    }
                ]
            };
        }
    } catch (error) {
        console.error("Error generating Bingr link:", error.message);
    }

    return { streams: [] };
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
